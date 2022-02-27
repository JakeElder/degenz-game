// import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "data/types";
import { Intents } from "discord.js";
// import Config from "app-config";

const { FLAGS } = Intents;

const sensei: Bot = {
  symbol: "SENSEI",
  name: "Sensei",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

export default sensei;
