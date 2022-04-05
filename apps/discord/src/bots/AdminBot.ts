import { Bot } from "data/types";
import AdminCommandController from "../command-controllers/AdminCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new AdminCommandController());
  }
}
