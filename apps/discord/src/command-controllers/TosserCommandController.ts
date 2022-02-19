import { CommandInteraction } from "discord.js";
import { CommandController } from "../CommandController";
import TossController from "../controllers/TossController";
import { Global } from "../Global";

export default class TosserCommandController extends CommandController {
  async toss(i: CommandInteraction) {
    await TossController.toss(i, Global.bot("ADMIN"));
  }
}
