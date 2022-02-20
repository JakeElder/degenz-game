import { bots } from "manifest";
import BankerCommandController from "../command-controllers/BankerCommandController";
import DiscordBot from "../DiscordBot";

export default class BankerBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.symbol === "BANKER");
    super(bot!, new BankerCommandController());
  }
}
