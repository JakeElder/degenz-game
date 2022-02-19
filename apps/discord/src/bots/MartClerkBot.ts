import { bots } from "manifest";
import MartClerkCommandController from "../command-controllers/MartClerkCommandController";
import DiscordBot from "../DiscordBot";
import Runner from "../Runner";

export default class MartClerkBot extends DiscordBot {
  constructor(runner: Runner) {
    const bot = bots.find((bot) => bot.id === "MART_CLERK");
    super(bot!, new MartClerkCommandController(runner));
  }
}
