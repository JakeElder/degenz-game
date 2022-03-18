import React from "react";
import { channelMention, userMention } from "@discordjs/builders";
import Config from "config";
import { NPC } from "data/db";
import { GuildMember, MessageOptions } from "discord.js";
import { Format } from "lib";
import random from "random";
import { Global } from "../Global";
import Utils from "../Utils";
import Stats, { StatsViewModel } from "../Stats";
import { PersistentMessageController } from "./PersistentMessageController";

const { r } = Utils;

type InfoMessageData = StatsViewModel & {
  emojis: string[];
};

export default class WelcomeRoomController {
  static intervalId: NodeJS.Timer;
  static maxMentions = 50;
  static minMentions = 5;

  static async init() {
    await this.updateInfoMessage();
    this.intervalId = setInterval(() => this.updateInfoMessage(), 6000);
  }

  static async updateInfoMessage() {
    const data = await this.computeInfoData();
    await this.setInfoMessage(data);
  }

  static async computeInfoData(): Promise<InfoMessageData> {
    const admin = Global.bot("ADMIN");
    const npcs = await NPC.find();

    const strength = random.int(10, 100);

    return {
      member: admin.guild.members.cache.random()!,
      imageURL: Stats.randomColourImage,
      strength,
      gbt: random.int(1, 3000),
      level: random.int(1, 20),
      emojis: npcs.map((npc) => npc.defaultEmojiId!),
      attributes: {
        strength: random.int(0, 30),
        luck: random.int(0, 30),
        charisma: random.int(0, 30),
      },
    };
  }

  static makeInfoMessage(data: InfoMessageData): MessageOptions {
    const content = r(
      <>
        **Welcome** to the **DEGENZ GAME** server {data.emojis.join(" ")}
        Your **Degenz NFT** (dropping **April** {"\u{1f680}"}) will be your in
        game character that give you access to unique commands, attributes and
        special areas inside **{Format.worldName()}**.
      </>
    );

    return {
      content,
      embeds: [Stats.makeEmbed(data)],
    };
  }

  static async setInfoMessage(data: InfoMessageData) {
    const bb = Global.bot("BIG_BROTHER");
    await bb.ready;

    const message = this.makeInfoMessage(data);
    await PersistentMessageController.set("WELCOME_INFO", message);
  }

  static async welcome(member: GuildMember) {
    const bb = Global.bot("BIG_BROTHER");
    await bb.ready;

    const welcomeChannel = await bb.getTextChannel(
      Config.channelId("WELCOME_ROOM")
    );

    const enterTheProjects = channelMention(
      Config.channelId("ENTER_THE_PROJECTS")
    );
    const generalRoom = channelMention(Config.channelId("GENERAL"));

    await welcomeChannel.send(
      r(
        <>
          **WELCOME, COMRADE** {userMention(member.id)}. To join the game, go to{" "}
          {enterTheProjects}, or come and chat in {generalRoom}.
        </>
      )
    );
  }
}
