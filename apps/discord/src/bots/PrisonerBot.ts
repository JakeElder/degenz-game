import { NPC } from "data/db";
import PrisonerCommandController from "../command-controllers/PrisonerCommandController";
import DiscordBot from "../DiscordBot";

export default class PrisonerBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new PrisonerCommandController());
  }
}
