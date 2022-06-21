import Config from "config";
import {
  Collection,
  GuildBasedChannel,
  GuildMember,
  Invite,
  Message,
  PartialMessage,
} from "discord.js";
import {
  DistrictSymbol,
  ManagedChannelSymbol,
  OperationResult,
} from "data/types";
import {
  CampaignInvite,
  District,
  User,
  Reaction,
  ENGAGEMENT_LEVELS,
  AppState,
} from "data/db";
import { Global } from "../Global";
import Events from "../Events";
import UserController from "./UserController";
import EntranceController from "./EntranceController";
import AchievementController from "./AchievementController";
import Utils from "../Utils";
import { In, QueryFailedError } from "typeorm";
import { uniq } from "lodash";
import memoize from "memoizee";
import cron from "node-cron";
import urlRegex from "url-regex";
import psl from "psl";

export default class AppController {
  static invites: Collection<string, Invite>;
  static processingReactions = false;
  static linkHostWhitelist = ["magiceden.io", "tenor.com", "giphy.com"];

  static async init() {
    this.bindEnterListener();
    this.initReactionCron();
    this.initStrengthDecayCron();
    // this.initLinkDetection();
  }

  static initLinkDetection() {
    const admin = Global.bot("ADMIN");
    admin.client.on("messageCreate", async (message) => {
      this.processMessage(message);
    });
    admin.client.on("messageUpdate", async (_, newMessage) => {
      this.processMessage(newMessage);
    });
  }

  static areLinksDisabled = memoize(
    async () => {
      const { linksDisabled } = await AppState.findOneByOrFail({
        id: "CURRENT",
      });
      return linksDisabled;
    },
    { promise: true, maxAge: 1000 * 4 }
  );

  static async processMessage(message: Message | PartialMessage) {
    const areDisabled = await this.areLinksDisabled();

    if (!areDisabled) {
      return;
    }

    if (message.partial) {
      message = await message.fetch();
    }

    const urls = message.content.match(urlRegex());

    if (!urls) {
      return;
    }

    const allowed = urls.filter((u) => {
      const url = new URL(u);
      return this.linkHostWhitelist.some((hostname) => {
        const parsed = psl.parse(url.hostname);
        if (parsed.error) {
          console.log("url parse error");
          return false;
        }
        return parsed.domain === hostname;
      });
    });

    if (urls.length !== allowed.length) {
      await message.delete();
      Events.emit("MESSAGE_DELETED", {
        message: message.content,
        userId: message.member?.id,
      });
    }
  }

  static initStrengthDecayCron() {
    cron.schedule("*/30 * * * *", () => {
      User.incStrength(-1);
    });
  }

  static async bindEnterListener() {
    const admin = Global.bot("ADMIN");
    this.invites = await admin.guild.invites.fetch({ cache: false });

    admin.client.on("guildMemberAdd", async (member) => {
      if (member.user.bot) {
        return;
      }

      const newInvites = await admin.guild.invites.fetch({ cache: false });
      const used = this.invites.find((i) => {
        const ni = newInvites.get(i.code)!;
        if (i.uses === null) {
          return ni.uses === 1;
        }
        return ni.uses !== null && ni.uses > i.uses;
      });

      if (used) {
        const ci = await CampaignInvite.findOne({
          where: { discordCode: used.code },
        });
        Events.emit("ENTER", {
          member,
          inviteCode: used.code,
          campaign: ci?.campaign || null,
        });
      } else {
        Events.emit("ENTER", { member, inviteCode: null, campaign: null });
      }

      this.invites = newInvites;
    });

    admin.client.on("inviteDelete", (invite) => {
      this.invites.delete(invite.code);
    });

    admin.client.on("inviteCreate", (invite) => {
      this.invites.set(invite.code, invite);
    });

    admin.client.on("guildMemberRemove", async (member) => {
      if (!member.user.bot) {
        UserController.eject(member.id);
        Events.emit("EXIT", { member });
      }
    });

    admin.client.on("messageReactionAdd", async (reaction, user) => {
      const managedIds = Config.managedChannels.map(
        (mc) => mc.discordChannel.id
      );

      if (!managedIds.includes(reaction.message.channel.id)) {
        return;
      }

      try {
        const channel = Config.channel(reaction.message.channel.id);
        await Reaction.insert({
          messageId: reaction.message.id,
          emojiId: (reaction.emoji.id || reaction.emoji.name)!,
          channel,
          user: { id: user.id },
        });
      } catch (e) {
        // Don't do anything if duplicate reaction
        if (e instanceof QueryFailedError && e.driverError.code === "23505") {
          return;
        }

        if (e instanceof QueryFailedError && e.driverError.code === "23503") {
          console.log(`reaction user not in DB: ${user.id}`);
          return;
        }
        console.error(e);
      }
    });

    admin.client.on("guildMemberUpdate", async (prevMember, member) => {
      const user = await User.findOne({
        where: { id: member.id },
      });

      if (!user) {
        Utils.rollbar.info(`User missing: ${member.displayName}:${member.id}`);
        return;
      }

      ENGAGEMENT_LEVELS.forEach((level) => {
        const role = Config.roleId(`ENGAGEMENT_LEVEL_${level}`);
        if (!prevMember.roles.cache.has(role) && member.roles.cache.has(role)) {
          AchievementController.checkAndAward(user, `LEVEL_${level}_REACHED`);
        }
      });

      if (
        !prevMember.roles.cache.has(Config.roleId("WHITELIST")) &&
        member.roles.cache.has(Config.roleId("WHITELIST"))
      ) {
        AchievementController.checkAndAward(
          user,
          "GET_WHITELIST_QUEST_COMPLETED"
        );
      }

      if (
        !prevMember.roles.cache.has(Config.roleId("HACKER")) &&
        member.roles.cache.has(Config.roleId("HACKER"))
      ) {
        AchievementController.checkAndAward(
          user,
          "LEARN_TO_HACKER_BATTLE_QUEST_COMPLETED"
        );
      }

      if (member.displayName !== user.displayName) {
        user.displayName = member.displayName;
        await user.save();
      }
    });
  }

  static async initReactionCron() {
    this.processReactions();
    setInterval(() => {
      if (!this.processingReactions) {
        this.processReactions();
      }
    }, 15_000);
  }

  static async processReactions() {
    // Mark reactions as being processed
    this.processingReactions = true;

    // Set channels to reward reactions
    const channels: ManagedChannelSymbol[] = [
      "ANNOUNCEMENTS",
      "UPDATES",
      "SNEAK_PEEKS",
      "GIVEAWAYS",
      "TWEETS",
      "RAIDS",
      "ENTRANCE",
      "QUESTS",
      "INVITE",
      "WHITELIST",
      "OFFICIAL_LINKS",
      "LEVEL_REWARDS",
      "FAQ",
      "THE_LORE",
      "NFT_CHARACTERS",
      "COMMANDS",
      "ROADMAP",
      "GET_PFP",
      "SUBMIT_WALLET",
      "TRAINING_DOJO",
      "JPEG_STORE",
      "LEADERBOARD",
      "HALL_OF_ALLEIGANCE",
      "ARMORY",
    ];

    // Get not processed reactions
    const reactions = await Reaction.find({
      where: {
        processed: false,
        channel: { id: In(channels) },
      },
    });

    if (reactions.length === 0) {
      this.processingReactions = false;
      return;
    }

    // Get all processed entries that match any new reactions so we can
    // limit max rewards to 10
    type RawReaction = {
      user_id: string;
      channel_id: ManagedChannelSymbol;
      message_id: string;
      count: string;
    };

    const past = await Reaction.createQueryBuilder("reaction")
      .select(["user_id", "channel_id", "message_id", "Count(*)"])
      .andWhere(
        `(user_id IN (:...user_ids) OR channel_id IN (:...channel_ids))`,
        {
          user_ids: uniq(reactions.map((r) => r.userId)),
          channel_ids: uniq(reactions.map((r) => r.channelId)),
        }
      )
      .andWhere({ processed: true })
      .groupBy("user_id")
      .addGroupBy("message_id")
      .addGroupBy("channel_id")
      .getRawMany<RawReaction>();

    // Define types to make data easy to manage
    type MessageManifest = {
      id: string;
      channelId: ManagedChannelSymbol;
      newReactions: number;
      processedReactions: number;
    };

    type ReactionManifest = {
      userId: User["id"];
      messages: MessageManifest[];
    };

    // Iterate through all new reactions
    // Make the data look like ReactionManifest[] for sane processing
    const users = reactions.reduce<ReactionManifest[]>((p, c) => {
      const processed = past.find(
        (r) => r.user_id === c.userId && r.message_id === c.messageId
      );

      // See if we already have this user in the array
      const userIndex = p.findIndex((m) => m.userId === c.userId);
      const user: ReactionManifest =
        userIndex === -1
          ? { userId: c.userId, messages: [] }
          : p.splice(userIndex, 1)[0];

      // See if we already have this message in the array
      const messageIndex = user.messages.findIndex((m) => m.id === c.messageId);
      const message: MessageManifest =
        messageIndex === -1
          ? {
              id: c.messageId,
              channelId: c.channelId,
              newReactions: 0,
              processedReactions: processed ? parseInt(processed.count, 10) : 0,
            }
          : user.messages.splice(messageIndex, 1)[0];

      // Inc new reactions, add/update message in array
      message.newReactions++;
      user.messages = [...user.messages, message];

      // Return with added/updated user
      return [...p, user];
    }, []);

    // We're only interested when we haven't already issued 10 rewards
    // per message
    const actionable = users.filter((u) => {
      return u.messages.some(
        (c) => c.newReactions > 0 && c.processedReactions < 10
      );
    });

    // Iterate users, calculate how many reactions should be rewarded
    const rewards = actionable.map((u) => {
      return u.messages.reduce((p, m) => {
        if (m.newReactions <= 0) {
          return p;
        }

        const reward = (() => {
          if (m.channelId === "ANNOUNCEMENTS") {
            return 30;
          }
          if (m.channelId === "UPDATES") {
            return 20;
          }
          return 10;
        })();

        const rewardableReactionCount = Math.max(
          Math.min(m.newReactions, 10 - m.processedReactions),
          0
        );

        return p + rewardableReactionCount * reward;
      }, 0);
    });

    // Get users to reward $GBT to
    const userRows = await User.findBy({
      id: In(actionable.map((u) => u.userId)),
    });

    // Update $GBT
    actionable.forEach((u, idx) => {
      const row = userRows.find((r) => r.id === u.userId);
      if (row) {
        row.gbt ??= 0;
        row.gbt += rewards[idx];
      }
    });

    // Set reactions to processed
    reactions.forEach((r) => {
      r.processed = true;
    });

    // Save reactions and users
    await Promise.all([Reaction.save(reactions), User.save(userRows)]);

    // Trigger events for HOP
    actionable.forEach((u, idx) => {
      const row = userRows.find((r) => r.id === u.userId);
      if (row) {
        Events.emit("REACTIONS_REWARDED", {
          user: row,
          yield: rewards[idx],
          channelIds: uniq(u.messages.map((m) => m.channelId)),
        });
      }
    });

    // Mark as finished processing
    this.processingReactions = false;
  }

  static async openDistrict(districtSymbol: DistrictSymbol) {
    await District.open(districtSymbol);
    await EntranceController.update();
  }

  static async closeDistrict(districtSymbol: DistrictSymbol) {
    await District.close(districtSymbol);
    await EntranceController.update();
  }

  static async sendMessageFromBot({
    as,
    channel,
    message,
  }: {
    as: GuildMember;
    channel: GuildBasedChannel;
    message: string;
  }): Promise<OperationResult<"NOT_A_BOT" | "BOT_NOT_FOUND">> {
    if (!as.user.bot) {
      return { success: false, code: "NOT_A_BOT" };
    }

    const botId = Config.reverseClientId(as.id);

    if (!botId) {
      return { success: false, code: "BOT_NOT_FOUND" };
    }

    const bot = Global.bot(botId);

    try {
      const c = await Utils.Channel.getOrFail(channel.id, botId);
      await c.send(message);
      Events.emit("SEND_MESSAGE_AS_EXECUTED", {
        bot: bot.npc,
        channel,
        message,
        success: true,
      });

      return { success: true };
    } catch (e) {
      Events.emit("SEND_MESSAGE_AS_EXECUTED", {
        bot: bot.npc,
        channel,
        message,
        success: false,
      });

      return {
        success: false,
        code: "EXCEPTION",
        message: (e as Error).message,
      };
    }
  }
}
