import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "data/types";
import { Intents } from "discord.js";
import Config from "app-config";
import { Format } from "lib";

const { FLAGS } = Intents;

const ally: Bot = {
  symbol: "ALLY",
  name: "Ivan 6000",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `eat` command
ally.commands.push({
  symbol: "EAT",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("eat")
    .setDescription(`Eat something.`)
    .toJSON(),
});

// `redpill` command
ally.commands.push({
  symbol: "RED_PILL",
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("redpill")
    .setDescription(`Join the Degenz army.`)
    .toJSON(),
});

// `stats` command
ally.commands.push({
  symbol: "STATS",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription(`Get your own or other citizens stats.`)
    .addUserOption((option) =>
      option.setName("name").setDescription("The citizen to retrieve info for.")
    )
    .toJSON(),
});

// `help` command
ally.commands.push({
  symbol: "HELP",
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(`Get help on the current channel.`)
    .toJSON(),
});

// `inventory` command
ally.commands.push({
  symbol: "INVENTORY",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription(`See your own, or another citizens inventory.`)
    .addUserOption((option) =>
      option.setName("name").setDescription("The citizen to retrieve info for.")
    )
    .toJSON(),
});

// `leaderboard` command
ally.commands.push({
  symbol: "LEADERBOARD",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .addNumberOption((option) =>
      option
        .setName("top")
        .setChoices([
          ["10", 10],
          ["30", 30],
          ["50", 50],
        ])
        .setDescription(`The amount of leaders to show.`)
    )
    .addBooleanOption((option) =>
      option
        .setName("post")
        .setDescription("Whether to publish in the current room.")
    )
    .setDescription(
      `See who has the most ${Format.currency(null, { bold: false })}.`
    )
    .toJSON(),
});

export default ally;
