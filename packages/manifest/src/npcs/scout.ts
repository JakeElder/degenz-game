import { plainToInstance } from "class-transformer";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const scout: RecursivePartial<NPC> = {
  id: "SCOUT",
  name: "Scout",
  clientOptions: { intents: ["GUILDS"] },
  commands: [],
};

export default plainToInstance(NPC, scout);
