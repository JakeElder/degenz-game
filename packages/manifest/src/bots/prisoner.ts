import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "data/types";
import { Intents } from "discord.js";
import Config from "app-config";

const { FLAGS } = Intents;

const prisoner: Bot = {
  symbol: "PRISONER",
  name: "Hugh Donie",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `escape` command
prisoner.commands.push({
  symbol: "ESCAPE",
  permissions: [
    { id: Config.roleId("PRISONER"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("escape")
    .setDescription(`Try and escape while Hugh keeps lookout.`)
    .addStringOption((option) =>
      option
        .setName("code")
        .setRequired(true)
        .setDescription("The door code to escape with.")
    )
    .toJSON(),
});

export default prisoner;
