import { plainToInstance } from "class-transformer";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const sensei: RecursivePartial<NPC> = {
  id: "SENSEI",
  name: "Sensei",
  emoji: { id: "SENSEI_NPC" },
  clientOptions: { intents: ["GUILDS"] },
};

export default plainToInstance(NPC, sensei);
