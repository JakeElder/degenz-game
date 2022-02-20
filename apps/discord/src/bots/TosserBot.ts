import { bots } from "manifest";
import TosserCommandController from "../command-controllers/TosserCommandController";
import DiscordBot from "../DiscordBot";

export default class BigBrotherBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.symbol === "TOSSER");
    super(bot!, new TosserCommandController());
  }
}
