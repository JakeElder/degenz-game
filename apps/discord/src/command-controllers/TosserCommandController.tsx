import { CommandInteraction } from "discord.js";
import { CommandController } from "../CommandController";
import TossController from "../controllers/TossV2Controller";

export default class TosserCommandController extends CommandController {
  async toss(i: CommandInteraction) {
    await TossController.toss(i);
  }
}
