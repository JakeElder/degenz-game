import { Bot } from "data/types";
import MartClerkCommandController from "../command-controllers/MartClerkCommandController";
import DiscordBot from "../DiscordBot";

export default class MartClerkBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new MartClerkCommandController());
  }
}
