import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "data/types";
import { Intents } from "discord.js";
import Config from "config";

const { FLAGS } = Intents;

const warden: Bot = {
  symbol: "WARDEN",
  name: "Walden",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `bribe` command
warden.commands.push({
  symbol: "BRIBE",
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

warden.commands.push({
  symbol: "IMPRISON",
  permissions: [
    { id: Config.roleId("THOUGHT_POLICE"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("imprison")
    .setDescription(`Imprison a member.`)
    .addUserOption((option) =>
      option
        .setName("member")
        .setRequired(true)
        .setDescription("The member to imprison")
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setRequired(true)
        .setDescription("The reason for imprisonment.")
    )
    .toJSON(),
});

warden.commands.push({
  symbol: "RELEASE",
  permissions: [
    { id: Config.roleId("THOUGHT_POLICE"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("release")
    .setDescription(`Release a prisoner`)
    .addUserOption((option) =>
      option
        .setName("member")
        .setRequired(true)
        .setDescription("The member to release")
    )
    .toJSON(),
});

export default warden;
