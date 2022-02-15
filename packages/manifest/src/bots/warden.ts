import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "types";
import { Intents } from "discord.js";
import Config from "app-config";

const { FLAGS } = Intents;

const warden: Bot = {
  id: "WARDEN",
  name: "Walden",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `bribe` command
warden.commands.push({
  id: "BRIBE",
  permissions: [
    { id: Config.roleId("PRISONER"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("bribe")
    .setDescription(
      `Bribe Walden. Maybe if it's enough he'll give you the door code.`
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setRequired(true)
        .setDescription("The amount to bribe with")
    )
    .toJSON(),
});

export default warden;
