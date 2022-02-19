import { bots } from "manifest";
import TosserCommandController from "../command-controllers/TosserCommandController";
import DiscordBot from "../DiscordBot";
import Runner from "../Runner";

export default class BigBrotherBot extends DiscordBot {
  constructor(runner: Runner) {
    const bot = bots.find((bot) => bot.id === "TOSSER");
    super(bot!, new TosserCommandController(runner));
  }
}
