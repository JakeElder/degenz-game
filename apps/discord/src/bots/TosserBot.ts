import { Bot } from "data/types";
import TosserCommandController from "../command-controllers/TosserCommandController";
import DiscordBot from "../DiscordBot";

export default class TosserBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new TosserCommandController());
  }
}
