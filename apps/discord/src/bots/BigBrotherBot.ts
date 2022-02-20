import { bots } from "manifest";
import BigBrotherCommandController from "../command-controllers/BigBrotherCommandController";
import DiscordBot from "../DiscordBot";

export default class BigBrotherBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.symbol === "BIG_BROTHER");
    super(bot!, new BigBrotherCommandController());
  }
}
