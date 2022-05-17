import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const bigBrother: RecursivePartial<NPC> = {
  id: "BIG_BROTHER",
  name: "Big Brother",
  emoji: { id: "BIG_BROTHER_NPC" },
  clientOptions: {
    intents: ["GUILD_MESSAGE_REACTIONS"],
    partials: ["MESSAGE", "REACTION"],
  },
  commands: [],
};

export default bigBrother;
