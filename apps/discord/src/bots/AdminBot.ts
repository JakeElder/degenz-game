import { NPC } from "data/db";
import AdminCommandController from "../command-controllers/AdminCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new AdminCommandController());
  }
}
