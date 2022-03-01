// import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "data/types";
import { Intents } from "discord.js";
// import Config from "config";

const { FLAGS } = Intents;

const devilsAdvocate: Bot = {
  symbol: "DEVILS_ADVOCATE",
  name: "Slice",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

export default devilsAdvocate;
