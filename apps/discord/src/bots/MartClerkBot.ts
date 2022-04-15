import { NPC } from "data/db";
import MartClerkCommandController from "../command-controllers/MartClerkCommandController";
import DiscordBot from "../DiscordBot";

export default class MartClerkBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new MartClerkCommandController());
  }
}
