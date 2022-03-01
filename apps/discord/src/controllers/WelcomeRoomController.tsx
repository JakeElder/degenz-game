import React from "react";
import { channelMention, userMention } from "@discordjs/builders";
import Config from "app-config";
import { NPC, User } from "data/db";
import { GuildMember, MessageEmbedOptions, MessageOptions } from "discord.js";
import { Format } from "lib";
import pluralize from "pluralize";
import random from "random";
import { getBorderCharacters, table } from "table";
import { Global } from "../Global";
import Utils from "../Utils";
import { PersistentMessageController } from "./PersistentMessageController";
import { In, MoreThan, Not } from "typeorm";
import listify from "listify";
import { DateTime } from "luxon";

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
  static maxMentions = 50;
  static minMentions = 5;

  static async init() {
    await this.updateInfoMessage();
    await this.updateWelcomeMessage();
    this.intervalId = setInterval(() => this.updateInfoMessage(), 6000);
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
    const cutoff = DateTime.now().minus({ minutes: 20 });

    const users = await User.find({
      where: { createdAt: MoreThan(cutoff) },
      order: { createdAt: -1 },
      take: this.maxMentions,
    });

    let extra: User[] = [];

    if (users.length < this.minMentions) {
      extra = await User.find({
        where: { id: Not(In(users.map((u) => u.id))) },
        order: { createdAt: -1 },
        take: this.minMentions - users.length,
      });
    }

    return {
      newestUsers: [...users, ...extra].map((u) => {
        return {
          tag: u.welcomeMentionMadeAt === null,
          displayName: u.displayName,
          discordId: u.discordId,
          id: u.id,
        };
      }),
    };
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
    const s = [
      [
        "\u2588".repeat((width - 4) * (strength / 100)),
        `|${strength.toString().padStart(3, " ")}`,
      ],
    ];

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
      columnDefault: { paddingLeft: 0, paddingRight: 0, alignment: "center" },
      drawVerticalLine: (idx) => [1, 2].includes(idx),
      columns: [
        { width: w0 },
        { width: w1, alignment: "center" },
        { width: w2 },
      ],
    });

    return attributes;
  }

  static makeInfoMessage(data: InfoMessageData) {
    const emojis = data.emojis.join(" ");
    const message: MessageOptions = {
      content: `**Welcome** to the **DEGENZ GAME** server ${emojis}\nYour **Degenz NFT** (dropping **March** \u{1f680}) will be your in game character that give you access to unique commands, attributes and special areas inside **${Format.worldName()}**.`,
      embeds: [
        {
          color: data.color,
          image: {
            url: data.imageURL,
            height: 680,
            width: 680,
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

    const message = this.makeInfoMessage(data);
    await PersistentMessageController.set("WELCOME_INFO", message);
  }

  static async setWelcomeMessage(data: WelcomeMessageData) {
    const bb = Global.bot("BIG_BROTHER");
    await bb.ready;

    const qualifier = pluralize("comrade", data.newestUsers.length);
    const mentionList = data.newestUsers.map((u) =>
      u.tag ? userMention(u.discordId) : `**${u.displayName}**`
    );

    const waitingRoom = channelMention(Config.channelId("WAITING_ROOM"));
    const generalRoom = channelMention(Config.channelId("GENERAL"));

    await PersistentMessageController.set(
      "WELCOME_NOTIFICATION",
      {
        content: r(
          <>
            **WELCOME, to our newest {qualifier}** - {listify(mentionList)}. To
            join the game, go to {waitingRoom}, or go and chat in {generalRoom}.
          </>
        ),
      },
      { replace: true }
    );

    await User.update(
      { id: In(data.newestUsers.filter((u) => u.tag).map((u) => u.id)) },
      { welcomeMentionMadeAt: new Date() }
    );
  }
}
