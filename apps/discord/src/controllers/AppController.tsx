import Config from "config";
import {
  Collection,
  GuildBasedChannel,
  GuildMember,
  Invite,
  MessageReaction,
  ReactionCollector,
  ThreadChannel,
  User as DiscordUser,
} from "discord.js";
import { DistrictSymbol, OperationResult } from "data/types";
import { CampaignInvite, District, User } from "data/db";
import { bots } from "manifest";
import { Global } from "../Global";
import Events from "../Events";
import EnterTheProjectsController from "./EnterTheProjectsController";
import { PersistentMessageController } from "./PersistentMessageController";
import UserController from "./UserController";
import { Channel } from "../Channel";
import OnboardController from "./OnboardController";

export default class AppController {
  static reactionCollector: ReactionCollector;
  static invites: Collection<string, Invite>;

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

    admin.client.on("guildMemberUpdate", async (_, newMember) => {
      User.update(
        { discordId: newMember.id },
        { displayName: newMember.displayName }
      );
    });

    admin.client.on("threadUpdate", async (oldThread, newThread) => {
      if (!oldThread.archived && newThread.archived) {
        const c = await Channel.getDescriptor(newThread.id);
        if (c.isOnboardingThread) {
          OnboardController.purgeThread(newThread);
        }
      }
    });
  }

  static async openDistrict(districtSymbol: DistrictSymbol) {
    await District.open(districtSymbol);
    await EnterTheProjectsController.update();
  }

  static async closeDistrict(districtSymbol: DistrictSymbol) {
    await District.close(districtSymbol);
    await EnterTheProjectsController.update();
  }

  static async purgeArchived(thread: ThreadChannel) {}

  static async setVerifyMessage() {
    const instruction =
      "Welcome. `REACT` to this message to prove you're not a bot.";

    const message = await PersistentMessageController.set("VERIFY", {
      content: instruction,
    });

    if (!message) {
      return;
    }

    if (this.reactionCollector) {
      this.reactionCollector.off("collect", this.handleReaction);
    }

    this.reactionCollector = message.createReactionCollector();
    this.reactionCollector.on("collect", this.handleReaction);
  }

  static async handleReaction(_: MessageReaction, user: DiscordUser) {
    const admin = Global.bot("ADMIN");
    const member = await admin.getMember(user.id);
    if (
      !member!.roles.cache.some((r) =>
        [Config.roleId("DEGEN"), Config.roleId("VERIFIED")].includes(r.id)
      )
    ) {
      await member!.roles.add(Config.roleId("VERIFIED"));
      Events.emit("MEMBER_VERIFIED", { member: member! });
    }
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

    const botData = bots.find((bot) => bot.symbol === botId);
    if (!botData) {
      return { success: false, code: "BOT_NOT_FOUND" };
    }

    const bot = Global.bot(botData.symbol);

    try {
      const c = await bot.getTextChannel(channel.id);
      await c.send(message);
      Events.emit("SEND_MESSAGE_AS_EXECUTED", {
        bot: botData,
        channel,
        message,
        success: true,
      });

      return { success: true };
    } catch (e) {
      Events.emit("SEND_MESSAGE_AS_EXECUTED", {
        bot: botData,
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
