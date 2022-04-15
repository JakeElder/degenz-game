import { NPC } from "data/db";
import BigBrotherCommandController from "../command-controllers/BigBrotherCommandController";
import DiscordBot from "../DiscordBot";

export default class BigBrotherBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new BigBrotherCommandController());
  }
}
