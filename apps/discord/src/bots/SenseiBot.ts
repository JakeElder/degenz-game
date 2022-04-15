import { NPC } from "data/db";
import SenseiCommandController from "../command-controllers/SenseiCommandController";
import DiscordBot from "../DiscordBot";

export default class SenseiBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new SenseiCommandController());
  }
}
