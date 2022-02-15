import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "types";
import { Intents } from "discord.js";

const { FLAGS } = Intents;

const bigBrother: Bot = {
  id: "BIG_BROTHER",
  name: "Big Brother",
  clientOptions: {
    intents: [FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ["MESSAGE", "REACTION"],
  },
  commands: [],
};

// `obey` command
bigBrother.commands.push({
  id: "OBEY",
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("obey")
    .setDescription(`Enter Beautopia`)
    .toJSON(),
});

export default bigBrother;
