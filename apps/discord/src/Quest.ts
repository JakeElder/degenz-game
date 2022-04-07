import React from "react";
import { QuestSymbol } from "data/types";
import {
  EmbedFieldData,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageOptions,
  Util,
} from "discord.js";
import { User } from "data/db";
import Config from "config";
import Utils from "./Utils";

type FormatProps = {
  title: string;
  thumbnail: string;
  description: React.ReactElement;
  progress: number;
  userDiscordId: GuildMember["id"];
  expanded: boolean;
  details: EmbedFieldData[];
};

export default abstract class Quest {
  symbol!: QuestSymbol;

  abstract message(user: User, expanded: boolean): Promise<MessageOptions>;
  abstract getProgress(user: User): Promise<number>;

  makeToggleButton({
    userDiscordId,
    expanded,
    complete,
  }: {
    userDiscordId: GuildMember["id"];
    expanded: boolean;
    complete: boolean;
  }) {
    return new MessageButton()
      .setLabel(expanded ? "Hide Details" : "Show Details")
      .setStyle(complete ? "SUCCESS" : "DANGER")
      .setCustomId(`TOGGLE_QUEST_DETAILS:${this.symbol}:${userDiscordId}`);
  }

  format(props: FormatProps): MessageOptions {
    const {
      title,
      description,
      thumbnail,
      progress,
      userDiscordId,
      expanded,
      details,
    } = props;

    const complete = progress === 1;
    const button = this.makeToggleButton({
      userDiscordId,
      expanded,
      complete,
    });
    const color = complete
      ? Util.resolveColor("GREEN")
      : Util.resolveColor("RED");

    return {
      embeds: [
        {
          title,
          thumbnail: { url: thumbnail },
          color,
          description: Utils.r(description),
          fields: [
            {
              name: "Progress",
              value: complete ? "\u2705 Complete" : "\u274c Incomplete",
            },
            ...details,
          ],
          image: { url: `${Config.env("WEB_URL")}/blank-row.png` },
        },
      ],
      components: [new MessageActionRow().addComponents(button)],
    };
  }
}
