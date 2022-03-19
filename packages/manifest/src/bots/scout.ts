import { Bot } from "data/types";
import { Intents } from "discord.js";

const { FLAGS } = Intents;

const scout: Bot = {
  symbol: "SCOUT",
  name: "Scout",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

export default scout;
