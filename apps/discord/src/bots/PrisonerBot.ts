import { bots } from "manifest";
import PrisonerCommandController from "../command-controllers/PrisonerCommandController";
import DiscordBot from "../DiscordBot";

export default class PrisonerBot extends DiscordBot {
  constructor() {
    const bot = bots.find((bot) => bot.id === "PRISONER");
    super(bot!, new PrisonerCommandController());
  }
}
