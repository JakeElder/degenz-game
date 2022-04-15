import Config from "config";
import { User } from "data/db";
import { EmbedFieldData } from "discord.js";
import React from "react";
import { ChannelMention, UserMention } from "../legacy/templates";
import Quest from "../Quest";
import Utils from "../Utils";

export default class LearnToHackerBattleQuest extends Quest {
  constructor() {
    super();
    this.symbol = "LEARN_TO_HACKER_BATTLE";
  }

  async getProgress(user: User) {
    let progress: number = user.hasAchievement("FINISHED_TRAINER") ? 1 : 0;
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
            If you want to learn to hacker battle, go and see{" "}
            <UserMention id={Config.clientId("SENSEI")} /> in the{" "}
            <ChannelMention id={Config.channelId("TRAINING_DOJO")} />. Just
            press the **LFG** button when you get there.
          </>
        ),
      });
    }

    return this.format({
      title: "Learn to Hacker Battle",
      thumbnail: `${Config.env("WEB_URL")}/characters/npcs/SENSEI.png`,
      progress,
      description: (
        <>
          **All** Degenz must learn to hacker battle with{" "}
          <UserMention id={Config.clientId("SENSEI")} />.
        </>
      ),
      expanded,
      details,
      userDiscordId: user.id,
    });
  }
}
