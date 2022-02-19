import { CommandInteraction } from "discord.js";
import { CommandController } from "../CommandController";
import Runner from "../Runner";
import TossController from "../controllers/TossController";

export default class TosserCommandController extends CommandController {
  async toss(i: CommandInteraction, runner: Runner) {
    await TossController.toss(i, runner.get("ADMIN"));
  }
}
