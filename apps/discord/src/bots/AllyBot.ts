import { bots } from "manifest";
import AllyCommandController from "../command-controllers/AllyCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.symbol === "ALLY");
    super(bot!, new AllyCommandController());
  }
}
