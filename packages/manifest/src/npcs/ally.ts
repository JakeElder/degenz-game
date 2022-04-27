import { SlashCommandBuilder } from "@discordjs/builders";
import { plainToInstance } from "class-transformer";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";
import { Format } from "lib";

const ally: RecursivePartial<NPC> = {
  id: "ALLY",
  name: "Ivan 6000",
  emoji: { id: "ALLY_NPC" },
  clientOptions: { intents: ["GUILDS"] },
};

ally.commands = [];

ally.commands.push({
  id: "EAT",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("eat")
    .setDescription(`Eat something.`)
    .toJSON(),
});

ally.commands.push({
  id: "RED_PILL",
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("redpill")
    .setDescription(`Join the Degenz army.`)
    .toJSON(),
});

// `stats` command
ally.commands.push({
  id: "STATS",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
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
  id: "HELP",
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(`Get help on the current channel.`)
    .toJSON(),
});

// `inventory` command
ally.commands.push({
  id: "INVENTORY",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
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
  id: "LEADERBOARD",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .addNumberOption((option) =>
      option
        .setName("top")
        .setChoices([
          ["5", 5],
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

export default plainToInstance(NPC, ally);
