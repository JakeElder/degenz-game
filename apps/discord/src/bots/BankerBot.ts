import { bots } from "manifest";
import BankerCommandController from "../controllers/BankerCommandController";
import DiscordBot from "../DiscordBot";
import Runner from "../Runner";

export default class BankerBot extends DiscordBot {
  constructor(runner: Runner) {
    const bot = bots.find((bot) => bot.id === "BANKER");
    super(bot!, new BankerCommandController(runner));
  }
}
