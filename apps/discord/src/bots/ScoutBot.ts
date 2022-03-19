import { bots } from "manifest";
import ScoutCommandController from "../command-controllers/ScoutCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.symbol === "SCOUT");
    super(bot!, new ScoutCommandController());
  }
}
