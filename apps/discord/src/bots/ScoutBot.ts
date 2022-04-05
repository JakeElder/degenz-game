import { Bot } from "data/types";
import ScoutCommandController from "../command-controllers/ScoutCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new ScoutCommandController());
  }
}
