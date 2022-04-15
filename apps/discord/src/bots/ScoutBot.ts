import { NPC } from "data/db";
import ScoutCommandController from "../command-controllers/ScoutCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new ScoutCommandController());
  }
}
