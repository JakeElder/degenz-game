import Config from "config";
import { MartItemOwnership, User } from "data/db";
import { EmbedFieldData } from "discord.js";
import React from "react";
import { ChannelMention } from "../legacy/templates";
import Quest from "../Quest";
import Utils from "../Utils";

export default class ShopAtMerrisMartQuest extends Quest {
  constructor() {
    super();
    this.symbol = "SHOP_AT_MERRIS_MART";
  }

  async getProgress(user: User) {
    const items = await MartItemOwnership.count({
      where: { user: { id: user.id } },
      withDeleted: true,
    });

    let progress: number = items > 0 ? 1 : 0;
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
            If you want to shop, go to the{" "}
            <ChannelMention id={Config.channelId("MART")} /> channel. Remember
            to type the `/help` command when you get there.
          </>
        ),
      });
    }

    return this.format({
      title: "Shop at Merris Mart",
      thumbnail: `${Config.env("WEB_URL")}/characters/npcs/MART_CLERK.png`,
      progress,
      description: (
        <>
          Check out <ChannelMention id={Config.channelId("MART")} /> and buy
          some of her products.
        </>
      ),
      expanded,
      details,
      userDiscordId: user.id,
    });
  }
}
