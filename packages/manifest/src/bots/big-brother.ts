import { Bot } from "data/types";
import { Intents } from "discord.js";

const { FLAGS } = Intents;

const bigBrother: Bot = {
  symbol: "BIG_BROTHER",
  name: "Big Brother",
  clientOptions: {
    intents: [FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ["MESSAGE", "REACTION"],
  },
  commands: [],
};

export default bigBrother;
