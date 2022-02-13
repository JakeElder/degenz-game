import DiscordBot from "../DiscordBot";
import { bots } from "manifest";

export default class AdminBot extends DiscordBot {
  constructor() {
    const admin = bots.find((bot) => bot.id === "ADMIN");
    super(admin!);
  }
}
