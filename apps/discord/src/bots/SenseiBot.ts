import { bots } from "manifest";
import SenseiCommandController from "../command-controllers/SenseiCommandController";
import DiscordBot from "../DiscordBot";

export default class SenseiBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.symbol === "SENSEI");
    super(bot!, new SenseiCommandController());
  }
}
