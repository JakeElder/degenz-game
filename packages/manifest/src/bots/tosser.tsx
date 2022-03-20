import React from "react";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "data/types";
import { Intents } from "discord.js";
import { channelMention, userMention } from "@discordjs/builders";
import Config from "config";
import { Format } from "lib";

const { FLAGS } = Intents;
const { r } = Format;

const tosser: Bot = {
  symbol: "TOSSER",
  name: "Tosser Ted",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `toss` command
tosser.commands.push({
  symbol: "TOSS",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  restrict: async (i, channel) => {
    if (channel.isTossHouse) {
      return false;
    }
    return {
      restricted: true,
      response: {
        content: r(
          <>
            {userMention(i.user.id)}, come to{" "}
            {channelMention(Config.channelId("TOSS_HOUSE"))} if you wanna toss.
          </>
        ),
        ephemeral: true,
      },
    };
  },
  data: new SlashCommandBuilder()
    .setName("toss")
    .setDescription(
      `Gamble your ${Format.currency(null, { bold: false })} on a coin flip.`
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setRequired(true)
        .setDescription(
          `The amount of ${Format.currency(null, { bold: false })} to bet.`
        )
    )
    .addUserOption((option) =>
      option
        .setName("opponent")
        .setRequired(true)
        .setDescription("Who are you tossing with?")
    )
    .toJSON(),
});

export default tosser;
