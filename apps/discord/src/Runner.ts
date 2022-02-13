import { BotId } from "types";
import DiscordBot from "./DiscordBot";

export default class Runner {
  private bots: Partial<Record<BotId, DiscordBot>> = {};

  add(bot: DiscordBot) {
    this.bots[bot.manifest.id] = bot;
  }

  destroy() {
    for (let b of Object.values(this.bots)) {
      b.destroy();
    }
  }
}
