import { bots } from "manifest";
import AdminCommandController from "../command-controllers/AdminCommandController";
import DiscordBot from "../DiscordBot";
import Runner from "../Runner";

export default class AdminBot extends DiscordBot {
  constructor(runner: Runner) {
    const bot = bots.find((bot) => bot.id === "ADMIN");
    super(bot!, new AdminCommandController(runner));
  }
}
