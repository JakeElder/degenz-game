import { Bot } from "data/types";
import AllyCommandController from "../command-controllers/AllyCommandController";
import DiscordBot from "../DiscordBot";

export default class AdminBot extends DiscordBot {
  constructor(descriptor: Bot) {
    super(descriptor, new AllyCommandController());
  }
}
