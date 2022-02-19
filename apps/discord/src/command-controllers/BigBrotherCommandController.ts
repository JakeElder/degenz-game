import { CommandInteraction } from "discord.js";
import { CommandController } from "../CommandController";

export default class BigBrotherCommandController extends CommandController {
  async obey(i: CommandInteraction) {
    return this.respond(i, "ok");
  }
}
