import { bots } from "manifest";
import WardenCommandController from "../command-controllers/WardenCommandController";
import DiscordBot from "../DiscordBot";

export default class WardenBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.symbol === "WARDEN");
    super(bot!, new WardenCommandController());
  }
}
