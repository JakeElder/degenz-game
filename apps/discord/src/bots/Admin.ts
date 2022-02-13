import { DiscordBot } from "lib";
import { bots } from "manifest";

export default class AdminBot extends DiscordBot {
  constructor() {
    super(bots.ADMIN!);
  }
}
