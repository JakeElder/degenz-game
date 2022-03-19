import Config from "config";
import {
  GuildBasedChannel,
  GuildMember,
  MessageReaction,
  ReactionCollector,
  User as DiscordUser,
} from "discord.js";
import { DistrictSymbol, OperationResult } from "data/types";
import { District, User } from "data/db";
import { bots } from "manifest";
import { Global } from "../Global";
import Events from "../Events";
import EnterTheProjectsController from "./EnterTheProjectsController";
import { PersistentMessageController } from "./PersistentMessageController";
import UserController from "./UserController";

export default class AppController {
  static reactionCollector: ReactionCollector;

  static async bindEnterListener() {
    const admin = Global.bot("ADMIN");
    admin.client.on("guildMemberAdd", async (member) => {
      if (!member.user.bot) {
        Events.emit("ENTER", { member });
      }
    });
    admin.client.on("guildMemberRemove", async (member) => {
      if (!member.user.bot) {
        UserController.eject(member.id);
        Events.emit("EXIT", { member });
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
