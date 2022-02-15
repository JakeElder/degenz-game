import { bots } from "manifest";
import BigBrotherCommandController from "../controllers/BigBrotherCommandController";
import DiscordBot from "../DiscordBot";
import Runner from "../Runner";

export default class BigBrotherBot extends DiscordBot {
  constructor(runner: Runner) {
    const bot = bots.find((bot) => bot.id === "BIG_BROTHER");
    super(bot!, new BigBrotherCommandController(runner));
  }
}
