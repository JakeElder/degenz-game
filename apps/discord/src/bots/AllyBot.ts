import { bots } from "manifest";
import AllyCommandController from "../command-controllers/AllyCommandController";
import DiscordBot from "../DiscordBot";
import Runner from "../Runner";

export default class AdminBot extends DiscordBot {
  constructor(runner: Runner) {
    const bot = bots.find((bot) => bot.id === "ALLY");
    super(bot!, new AllyCommandController(runner));
  }
}
