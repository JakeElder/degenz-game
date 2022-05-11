import Config from "config";
import { Collection, GuildBasedChannel, GuildMember, Invite } from "discord.js";
import { DistrictSymbol, OperationResult } from "data/types";
import { CampaignInvite, District, User } from "data/db";
import { Global } from "../Global";
import Events from "../Events";
import UserController from "./UserController";
import EntranceController from "./EntranceController";
import AchievementController from "./AchievementController";
import Utils from "../Utils";

export default class AppController {
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

    admin.client.on("guildMemberUpdate", async (prevMember, member) => {
      const user = await User.findOne({
        where: { id: member.id },
      });

      if (!user) {
        Utils.rollbar.info(`User missing: ${member.displayName}:${member.id}`);
        return;
      }

      ([2, 4, 6, 8, 10] as const).forEach((level) => {
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
