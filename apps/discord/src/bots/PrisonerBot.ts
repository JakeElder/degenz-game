import { bots } from "manifest";
import PrisonerCommandController from "../controllers/PrisonerCommandController";
import DiscordBot from "../DiscordBot";
import Runner from "../Runner";

export default class PrisonerBot extends DiscordBot {
  constructor(runner: Runner) {
    const bot = bots.find((bot) => bot.id === "PRISONER");
    super(bot!, new PrisonerCommandController(runner));
  }
}
