import { Bot } from "data/types";
import PrisonerCommandController from "../command-controllers/PrisonerCommandController";
import DiscordBot from "../DiscordBot";

export default class PrisonerBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new PrisonerCommandController());
  }
}
