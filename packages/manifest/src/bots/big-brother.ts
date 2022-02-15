import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "types";
import { Intents } from "discord.js";

const { FLAGS } = Intents;

const admin: Bot = {
  id: "BIG_BROTHER",
  name: "Big Brother",
  clientOptions: {
    intents: [FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ["MESSAGE", "REACTION"],
  },
  commands: [],
};

// `obey` command
admin.commands.push({
  id: "OBEY",
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("obey")
    .setDescription(`Enter Beautopia`)
    .toJSON(),
});

export default admin;
