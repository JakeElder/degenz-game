import Config from "config";
import { User } from "data/db";
import { Achievement } from "data/types";
import { EmbedFieldData } from "discord.js";
import React from "react";
import { Global } from "../Global";
import { ChannelMention } from "../legacy/templates";
import Quest from "../Quest";
import Utils from "../Utils";

export default class GetWhitelistQuest extends Quest {
  constructor() {
    super();
    this.symbol = "GET_WHITELIST";
  }

  async getProgress(user: User) {
    const admin = Global.bot("ADMIN");
    const member = await admin.guild.members.fetch(user.discordId);
    if (!member) {
      throw new Error(`Member ${user.displayName} not found`);
    }
    let progress: number = member.roles.cache.has(Config.roleId("WHITELIST"))
      ? 1
      : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    const details: EmbedFieldData[] = [];

    if (expanded) {
      details.push({
        name: "Details",
        value: Utils.r(
          <>
            If you want Whitelist, go to the{" "}
            <ChannelMention id={Config.channelId("WHITELIST")} /> channel.
            <br />
            And press the **"Give Me Whitelist"** button.
          </>
        ),
      });
    }

    return this.format({
      title: "Get Whitelist",
      thumbnail: `${Config.env(
        "WEB_URL"
      )}/characters/npcs/RESISTANCE_LEADER.png`,
      progress,
      description: <>Who *doesn't* want Whitelist?</>,
      expanded,
      details,
      userDiscordId: user.discordId,
    });
  }
}
