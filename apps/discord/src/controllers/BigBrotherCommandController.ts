import { CommandInteraction } from "discord.js";
import { CommandController } from "../CommandController";
import Runner from "../Runner";

export default class BigBrotherCommandController extends CommandController {
  async obey(i: CommandInteraction, runner: Runner) {
    return this.respond(i, "ok");
  }
}
