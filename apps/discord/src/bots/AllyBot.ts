import { NPC } from "data/db";
import AllyCommandController from "../command-controllers/AllyCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new AllyCommandController());
  }
}
