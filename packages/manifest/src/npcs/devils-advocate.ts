import { plainToInstance } from "class-transformer";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const devilsAdvocate: RecursivePartial<NPC> = {
  id: "DEVILS_ADVOCATE",
  name: "Slice",
  emoji: { id: "DEVILS_ADVOCATE_NPC" },
  clientOptions: { intents: ["GUILDS"] },
  commands: [],
};

export default plainToInstance(NPC, devilsAdvocate);
