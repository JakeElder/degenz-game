import { bots } from "manifest";
import BigBrotherCommandController from "../controllers/BigBrotherCommandController";
import DiscordBot from "../DiscordBot";

export default class BigBrotherBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.id === "BIG_BROTHER");
    super(bot!, new BigBrotherCommandController());
  }
}
