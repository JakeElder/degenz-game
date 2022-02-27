// import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "data/types";
import { Intents } from "discord.js";
// import Config from "app-config";

const { FLAGS } = Intents;

const armoryClerk: Bot = {
  symbol: "ARMORY_CLERK",
  name: "Private Willy",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

export default armoryClerk;
