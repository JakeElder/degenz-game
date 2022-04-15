import { NPC } from "data/db";
import WardenCommandController from "../command-controllers/WardenCommandController";
import DiscordBot from "../DiscordBot";

export default class WardenBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new WardenCommandController());
  }
}
