import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "types";
import { Intents } from "discord.js";
import Config from "app-config";

const { FLAGS } = Intents;

const martClerk: Bot = {
  symbol: "MART_CLERK",
  name: "Merris",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `stock` command
martClerk.commands.push({
  symbol: "STOCK",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
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
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription(`Buy a thing.`)
    .toJSON(),
});

export default martClerk;
