import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "types";
import { Intents } from "discord.js";
import Config from "app-config";

const { FLAGS } = Intents;

const admin: Bot = {
  id: "ALLY",
  name: "Ivan 6000",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `eat` command
admin.commands.push({
  id: "EAT",
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
admin.commands.push({
  id: "RED_PILL",
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("redpill")
    .setDescription(`Join the Degenz army.`)
    .toJSON(),
});

// `stats` command
admin.commands.push({
  id: "STATS",
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
admin.commands.push({
  id: "HELP",
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(`Get help on the current channel.`)
    .toJSON(),
});

export default admin;
