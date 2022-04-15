import { NPC } from "data/db";
import TosserCommandController from "../command-controllers/TosserCommandController";
import DiscordBot from "../DiscordBot";

export default class TosserBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new TosserCommandController());
  }
}
