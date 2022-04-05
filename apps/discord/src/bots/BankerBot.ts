import { Bot } from "data/types";
import BankerCommandController from "../command-controllers/BankerCommandController";
import DiscordBot from "../DiscordBot";

export default class BankerBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new BankerCommandController());
  }
}
