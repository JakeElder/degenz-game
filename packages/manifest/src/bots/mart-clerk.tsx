import React from "react";
import {
  channelMention,
  SlashCommandBuilder,
  userMention,
} from "@discordjs/builders";
import { Bot } from "data/types";
import { Intents } from "discord.js";
import Config from "config";
import { Format } from "lib";

const { FLAGS } = Intents;
const { r } = Format;

const martClerk: Bot = {
  symbol: "MART_CLERK",
  name: "Merris",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

const restrictToMart: Bot["commands"][0]["restrict"] = async (i, channel) => {
  if (channel.isMart) {
    return false;
  }
  return {
    restricted: true,
    response: {
      content: r(
        <>
          {userMention(i.user.id)}, come to{" "}
          {channelMention(Config.channelId("MART"))} if you want to buy stuff.
        </>
      ),
      ephemeral: true,
    },
  };
};

// `stock` command
martClerk.commands.push({
  symbol: "STOCK",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  restrict: restrictToMart,
  data: new SlashCommandBuilder()
    .setName("stock")
    .setDescription(`Find out what's left at Merris Mart.`)
    .toJSON(),
});

// `buy` command
martClerk.commands.push({
  symbol: "BUY",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  restrict: restrictToMart,
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription(`Buy a thing.`)
    .toJSON(),
});

export default martClerk;
