import { Bot } from "data/types";
import SenseiCommandController from "../command-controllers/SenseiCommandController";
import DiscordBot from "../DiscordBot";

export default class SenseiBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new SenseiCommandController());
  }
}
