import { CommandInteraction } from "discord.js";
import { CommandController } from "../CommandController";
import BigBrotherBot from "../bots/BigBrotherBot";

export default class BigBrotherCommandController extends CommandController {
  async obey(i: CommandInteraction, bot: BigBrotherBot) {
    return this.respond(i, "ok");
  }
}
