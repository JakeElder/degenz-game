import { bots } from "manifest";
import WardenCommandController from "../controllers/WardenCommandController";
import DiscordBot from "../DiscordBot";
import Runner from "../Runner";

export default class WardenBot extends DiscordBot {
  constructor(runner: Runner) {
    const bot = bots.find((bot) => bot.id === "WARDEN");
    super(bot!, new WardenCommandController(runner));
  }
}
