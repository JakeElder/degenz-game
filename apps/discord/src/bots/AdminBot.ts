import { bots } from "manifest";
import AdminCommandController from "../command-controllers/AdminCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.id === "ADMIN");
    super(bot!, new AdminCommandController());
  }
}
