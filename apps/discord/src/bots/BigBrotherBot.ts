import { Bot } from "data/types";
import BigBrotherCommandController from "../command-controllers/BigBrotherCommandController";
import DiscordBot from "../DiscordBot";

export default class BigBrotherBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new BigBrotherCommandController());
  }
}
