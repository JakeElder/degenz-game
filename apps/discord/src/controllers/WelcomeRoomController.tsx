import React from "react";
import { channelMention, userMention } from "@discordjs/builders";
import Config from "app-config";
import { AppState, NPC, User } from "data/db";
import {
  GuildMember,
  Message,
  MessageEmbedOptions,
  MessageOptions,
} from "discord.js";
import { Format } from "lib";
import pluralize from "pluralize";
import random from "random";
import { getBorderCharacters, table } from "table";
import { Global } from "../Global";
import Utils from "../Utils";

const { r } = Utils;

type InfoMessageData = {
  member: GuildMember;
  imageURL: string;
  strength: number;
  color: MessageEmbedOptions["color"];
  emojis: string[];
  attributes: {
    strength: number;
    luck: number;
    charisma: number;
  };
};

type WelcomeMessageData = {
  newestUsers: {
    id: User["id"];
    discordId: User["discordId"];
    displayName: User["displayName"];
    tag: boolean;
  }[];
};

export default class WelcomeRoomController {
  static intervalId: NodeJS.Timer;
  static maxMentions = 30;
  static minMentions = 10;
  static newUntil = 1 * 60 * 10; // 10 minutes as seconds

  static async init() {
    await this.updateInfoMessage();
    await this.updateWelcomeMessage();
    this.intervalId = setInterval(() => this.updateInfoMessage(), 10_000);
  }

  static async updateInfoMessage() {
    const data = await this.computeInfoData();
    await this.setInfoMessage(data);
  }

  static async updateWelcomeMessage() {
    const data = await this.computeWelcomeData();
    await this.setWelcomeMessage(data);
  }

  static async computeWelcomeData(): Promise<WelcomeMessageData> {
    return { newestUsers: [] };
  }

  static async computeInfoData(): Promise<InfoMessageData> {
    const admin = Global.bot("ADMIN");
    const [members, npcs] = await Promise.all([
      admin.guild.members.fetch(),
      NPC.find(),
    ]);

    const strength = random.int(10, 100);

    return {
      member: members.random()!,
      imageURL: this.randomColourImage,
      strength,
      color: strength > 80 ? "GREEN" : strength > 30 ? "ORANGE" : "RED",
      emojis: npcs.map((npc) => npc.defaultEmojiId!),
      attributes: {
        strength: random.int(0, 30),
        luck: random.int(0, 30),
        charisma: random.int(0, 30),
      },
    };
  }

  static makeStrengthBar(strength: number, width: number = 34) {
    // prettier-ignore
    const s = [
      ['\u2588'.repeat((width - 4) * (strength / 100)), `|${strength.toString().padStart(3, ' ')}`]
    ]

    const bar = table(s, {
      border: getBorderCharacters("void"),
      columnDefault: { paddingLeft: 0, paddingRight: 0 },
      drawHorizontalLine: () => false,
      columns: [{ width: width - 4 }, { width: 4 }],
    });

    return bar;
  }

  static get randomColourImage() {
    const image = `${random.int(1, 35).toString().padStart(4, "0")}.png`;
    return `${Config.env("WEB_URL")}/characters/colour/${image}`;
  }

  static makeAttributes(data: InfoMessageData, width: number = 34) {
    const { strength, luck, charisma } = data.attributes;
    // prettier-ignore
    const s = [
      ['Strength', 'Luck', 'Charisma'],
      [`+${strength}`, `+${luck}`, `+${charisma}`]
    ]

    const cw = 2;
    const wa = width - cw;

    const w0 = Math.ceil(wa / 3);
    const w2 = Math.ceil(wa / 3);
    const w1 = wa - (w0 + w2);

    const attributes = table(s, {
      // border: getBorderCharacters("void"),
      columnDefault: { paddingLeft: 0, paddingRight: 0, alignment: "center" },
      drawVerticalLine: (idx) => [1, 2].includes(idx),
      // drawHorizontalLine: () => false,
      columns: [
        { width: w0 },
        { width: w1, alignment: "center" },
        { width: w2 },
      ],
    });

    return attributes;
  }

  static makeInfoMessage(data: InfoMessageData) {
    const message: MessageOptions = {
      content: `**Welcome** to the **DEGENZ GAME** server ${data.emojis.join()}. \nYour **Degenz NFT** (dropping **March** \u{1f680}) will be your in game character that give you access to unique commands, attributes and special areas inside **${Format.worldName()}**.`,
      embeds: [
        {
          color: data.color,
          image: {
            url: data.imageURL,
          },
          author: {
            name: data.member.displayName,
            iconURL: data.member.displayAvatarURL(),
          },
          description: `\`Level ${random.int(1, 100)} Degen\``,
          fields: [
            {
              name: Format.currency(null, { full: true, plural: true }),
              value: Format.codeBlock(
                Format.currency(random.int(0, 3000), { bare: true })
              ),
            },
            {
              name: "Strength",
              value: Format.codeBlock(this.makeStrengthBar(data.strength)),
            },
            {
              name: "Attributes",
              value: Format.codeBlock(this.makeAttributes(data)),
            },
            // { name: "Strength", value: `\`\`\`${strengthBar}\`\`\`` },
            // {
            //   name: "Achievements",
            //   value: `\`\`\`${user.achievements
            //     .map((a) => `${TROPHY} ${a.symbol}`)
            //     .join("\n")}\`\`\``,
            // },
          ],
        },
      ],
    };

    return message;
  }

  static async setInfoMessage(data: InfoMessageData) {
    const bb = Global.bot("BIG_BROTHER");
    await bb.ready;

    const state = await AppState.findOneOrFail();
    const c = await bb.getTextChannel(Config.channelId("WELCOME_ROOM"));

    let message: Message;
    let isNew = false;

    const s = this.makeInfoMessage(data);

    const makeNew = async () => {
      isNew = true;
      return c.send(s);
    };

    if (!state.welcomeInfoMessageId) {
      message = await makeNew();
    } else {
      try {
        message = await c.messages.fetch(state.welcomeInfoMessageId);
        await message.edit(s);
      } catch (e) {
        message = await makeNew();
      }
    }

    if (isNew) {
      await AppState.setWelcomeInfoMessageId(message.id);
    }
  }

  static async setWelcomeMessage(data: WelcomeMessageData) {
    const bb = Global.bot("BIG_BROTHER");
    await bb.ready;

    const c = await bb.getTextChannel(Config.channelId("WELCOME_ROOM"));

    if (data.newestUsers.length === 0) {
      return;
    }

    const qualifier = pluralize("comrade", data.newestUsers.length);
    const mentionList = data.newestUsers.map((u) =>
      u.tag ? userMention(u.discordId) : `**${u.displayName}**`
    );
    const waitingRoom = channelMention(Config.channelId("WAITING_ROOM"));
    const generalRoom = channelMention(Config.channelId("GENERAL"));

    await c.send(
      r(
        <>
          **Welcome, to our newest {qualifier} - {mentionList.join(" ")}**. To
          join the game, go to {waitingRoom}, or go and chat in {generalRoom}.
        </>
      )
    );
  }
}
