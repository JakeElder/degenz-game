import Config from "config";
import { User } from "data/db";
import { Achievement } from "data/types";
import { EmbedFieldData } from "discord.js";
import React from "react";
import { ChannelMention, UserMention } from "../legacy/templates";
import Quest from "../Quest";
import Utils from "../Utils";

export default class TossWithTedQuest extends Quest {
  constructor() {
    super();
    this.symbol = "TOSS_WITH_TED";
  }

  async getProgress(user: User) {
    let progress: number = user.hasAchievement(Achievement.TOSS_COMPLETED)
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
            If you want to gamble, go and see{" "}
            <UserMention id={Config.clientId("TOSSER")} /> in{" "}
            <ChannelMention id={Config.channelId("TOSS_HOUSE")} />. Remember to
            type the `/help` command when you get there.
          </>
        ),
      });
    }

    return this.format({
      title: "Toss with Ted",
      thumbnail: `${Config.env("WEB_URL")}/characters/npcs/TOSSER.png`,
      progress,
      description: (
        <>
          Go and toss a coin at{" "}
          <ChannelMention id={Config.channelId("TOSS_HOUSE")} />
        </>
      ),
      expanded,
      details,
      userDiscordId: user.discordId,
    });
  }
}
