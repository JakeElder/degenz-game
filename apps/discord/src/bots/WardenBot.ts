import { Bot } from "data/types";
import WardenCommandController from "../command-controllers/WardenCommandController";
import DiscordBot from "../DiscordBot";

export default class WardenBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new WardenCommandController());
  }
}
