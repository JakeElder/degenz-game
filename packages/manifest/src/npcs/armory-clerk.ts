import { plainToInstance } from "class-transformer";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const armoryClerk: RecursivePartial<NPC> = {
  id: "ARMORY_CLERK",
  name: "PrivateWilly",
  emoji: { id: "ARMORY_CLERK_NPC" },
  clientOptions: { intents: ["GUILDS"] },
  commands: [],
};

export default plainToInstance(NPC, armoryClerk);
