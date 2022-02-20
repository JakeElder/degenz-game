import React from "react";
import Config from "app-config";
import {
  ButtonInteraction,
  GuildBasedChannel,
  GuildMember,
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageOptions,
  MessageReaction,
  ReactionCollector,
  User as DiscordUser,
} from "discord.js";
import { DistrictSymbol, OperationResult } from "types";
import { AppState, District, User } from "db";
import { Format } from "lib";
import { channelMention, userMention } from "@discordjs/builders";
import equal from "fast-deep-equal";
import { bots } from "manifest";
import UserController from "./UserController";
import { Global } from "../Global";
import { getLeaders } from "../legacy/db";
import { makeLeaderboardEmbed } from "../legacy/utils";
import Events from "../Events";
import Utils from "../Utils";
import WaitingRoomController from "./WaitingRoomController";

const { r } = Utils;

export default class AppController {
  static leaderboardCronInterval: NodeJS.Timer;
  static leaderboardTableData: any = [];
  static leaderboardMessage: Message;
  static reactionCollector: ReactionCollector;
  static buttonCollector: InteractionCollector<ButtonInteraction>;

  static async openDistrict(districtSymbol: DistrictSymbol) {
    await District.open(districtSymbol);
    await this.setEnterMessage();
  }

  static async closeDistrict(districtSymbol: DistrictSymbol) {
    await District.close(districtSymbol);
    await this.setEnterMessage();
  }

  static async setLeaderboardMessage() {
    const bb = Global.bot("BIG_BROTHER");

    const state = await AppState.findOneOrFail();
    const c = await bb.getTextChannel(Config.channelId("LEADERBOARD"));

    try {
      this.leaderboardMessage = await c.messages.fetch(
        `${state.leaderboardMessageId}`
      );
    } catch (e) {
      this.leaderboardMessage = await c.send({
        embeds: [{ description: "-" }],
      });
      await AppState.setLeaderboardMessageId(this.leaderboardMessage.id);
    }

    this.leaderboardCronInterval = setInterval(
      () => this.updateLeaderboard(),
      1000
    );
  }

  static async updateLeaderboard() {
    const leaders = await getLeaders();
    const tableData = [...leaders.map((l) => [l.displayName, l.gbt])];

    if (equal(this.leaderboardTableData, tableData)) {
      return;
    }

    await this.leaderboardMessage.edit({
      embeds: [makeLeaderboardEmbed(leaders)],
    });

    this.leaderboardTableData = tableData;
  }

  static async setVerifyMessage() {
    const [bb] = Global.bots("BIG_BROTHER");
    const c = await bb.getTextChannel(Config.channelId("VERIFICATION"));

    let message: Message;

    const state = await AppState.findOneOrFail();
    const instruction =
      "Welcome. `REACT` to this message to prove you're not a bot.";

    try {
      message = await c.messages.fetch(`${state.verifyMessageId}`);
    } catch (e) {
      message = await c.send(instruction);
      AppState.setVerifyMessageId(message.id);
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
      !member.roles.cache.some((r) =>
        [Config.roleId("DEGEN"), Config.roleId("VERIFIED")].includes(r.id)
      )
    ) {
      await member.roles.add(Config.roleId("VERIFIED"));
      Events.emit("MEMBER_VERIFIED", { member });
      await AppController.welcome(member);
    }
  }

  static async welcome(member: GuildMember) {
    const bb = Global.bot("BIG_BROTHER");
    const c = await bb.getTextChannel(Config.channelId("WELCOME_ROOM"));
    await c.send(
      r(
        <>
          **WELCOME, COMRADE {userMention(member.id)}**. To join the game, go to{" "}
          {channelMention(Config.channelId("WAITING_ROOM"))}, or ask any
          questions in {channelMention(Config.channelId("GENERAL"))}.
        </>
      )
    );
  }

  static async setEnterMessage() {
    const bb = Global.bot("BIG_BROTHER");

    const state = await AppState.findOneOrFail();
    const c = await bb.getTextChannel(Config.channelId("WAITING_ROOM"));
    const capacity = Config.general("DISTRICT_CAPACITY");

    const districts = await District.find({
      relations: ["tenancies"],
      order: { symbol: 1 },
    });

    const buttons = districts.map((d) => {
      const enabled = d.open && d.tenancies.length < capacity;
      return new MessageButton()
        .setLabel("JOIN")
        .setEmoji(enabled ? d.activeEmoji : d.inactiveEmoji)
        .setStyle(enabled ? "SUCCESS" : "SECONDARY")
        .setDisabled(!enabled)
        .setCustomId(d.symbol);
    });

    const d = districts
      .map((d) => {
        const available = capacity - d.tenancies.length;
        const open = d.open && available > 0;
        return `${d.open ? d.activeEmoji : d.inactiveEmoji} => ${
          open
            ? `\`${available} AVAILABLE\``
            : `\`${d.open ? "FULL" : "CLOSED"}\``
        }`;
      })
      .join("\n");

    const s: MessageOptions = {
      content: `**SPACE IN ${Format.worldName()} IS LIMITED**.\nSee the below information to see for available apartments. **Press the buttons below** to join a district and enter the game.`,
      embeds: [
        {
          author: {
            iconURL:
              "https://s10.gifyu.com/images/Mind-Control-Degenz-V2-min.gif",
            name: "Available Apartments",
          },
          // title: ":cityscape:\u200b \u200bAvailable Apartments",
          description: `Beautopia is divided in to districts, 1 to 6. To play the game, you'll need your own apartment. As apartments become available, the buttons below will become active. Check back often to secure your space in ${Format.worldName()}.\n\n${d}`,
          footer: {
            // iconURL: bb.client.user!.displayAvatarURL(),
            text: "Press the District button below to join that district.",
          },
        },
      ],
      components: [
        new MessageActionRow().addComponents(buttons.slice(0, 3)),
        new MessageActionRow().addComponents(buttons.slice(3)),
      ],
    };

    let message: Message;

    if (state.entryMessageId) {
      try {
        message = await c.messages.fetch(state.entryMessageId);
        message.edit(s);
      } catch (e) {
        message = await c.send(s);
        AppState.setEntryMessageId(message.id);
      }
    } else {
      message = await c.send(s);
      AppState.setEntryMessageId(message.id);
    }

    const open = districts.some((d) => {
      const available = capacity - d.tenancies.length;
      return d.open && available > 0;
    });

    WaitingRoomController.setStatus(open);

    if (this.buttonCollector) {
      this.buttonCollector.off("collect", this.handleButtonPress);
    }

    this.buttonCollector = message.createMessageComponentCollector({
      componentType: "BUTTON",
    });

    this.buttonCollector.on("collect", this.handleButtonPress);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    const user = await User.findOne({ where: { discordId: i.user.id } });

    if (user) {
      await i.reply({
        content: `${userMention(user.discordId)} - You're already a Degen.`,
        ephemeral: true,
      });
      return;
    }

    const res = await UserController.init(
      i.user.id,
      true,
      i.customId as DistrictSymbol
    );

    if (res.success) {
      await Promise.all([
        i.reply({
          content: `${userMention(i.user.id)} - ${channelMention(
            res.user!.primaryTenancy.discordChannelId
          )}, your new *private* apartment to receive further instructions.`,
          ephemeral: true,
        }),
        AppController.setEnterMessage(),
      ]);
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
