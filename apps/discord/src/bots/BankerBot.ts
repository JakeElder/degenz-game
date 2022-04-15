import { NPC } from "data/db";
import BankerCommandController from "../command-controllers/BankerCommandController";
import DiscordBot from "../DiscordBot";

export default class BankerBot extends DiscordBot {
  constructor(npc: NPC) {
    super(npc, new BankerCommandController());
  }
}
