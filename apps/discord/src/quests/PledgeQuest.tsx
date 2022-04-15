import Config from "config";
import { Pledge, User } from "data/db";
import { EmbedFieldData } from "discord.js";
import { Format } from "lib";
import React from "react";
import { ChannelMention, UserMention } from "../legacy/templates";
import Quest from "../Quest";
import Utils from "../Utils";

export default class PledgeQuest extends Quest {
  constructor() {
    super();
    this.symbol = "PLEDGE";
  }

  async getProgress(user: User) {
    const pledges = await Pledge.count({ where: { user: { id: user.id } } });
    const progress: number = pledges > 0 ? 1 : 0;
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
            Go to <ChannelMention id={Config.channelId("HALL_OF_ALLEIGANCE")} />{" "}
            and press the **PLEDGE** button to receive your first allowance.
          </>
        ),
      });
    }

    return this.format({
      title: "Pledge Allegiance to Big Brother",
      thumbnail: `${Config.env("WEB_URL")}/characters/npcs/BIG_BROTHER.png`,
      progress,
      description: (
        <>
          Pledge your allegiance to{" "}
          <UserMention id={Config.clientId("BIG_BROTHER")} /> and receive **
          {Format.token()}**.
        </>
      ),
      expanded,
      details,
      userDiscordId: user.id,
    });
  }
}
