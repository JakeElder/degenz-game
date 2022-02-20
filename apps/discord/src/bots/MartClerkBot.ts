import { bots } from "manifest";
import MartClerkCommandController from "../command-controllers/MartClerkCommandController";
import DiscordBot from "../DiscordBot";

export default class MartClerkBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.symbol === "MART_CLERK");
    super(bot!, new MartClerkCommandController());
  }
}
