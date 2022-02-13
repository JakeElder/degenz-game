import { BotId } from "types";
import { DiscordBot } from ".";

export default class Runner {
  private bots: Partial<Record<BotId, DiscordBot>> = {};

  add(bot: DiscordBot) {
    this.bots[bot.manifest.id] = bot;
    console.log(this.bots);
  }

  destroy() {
    for (let b of Object.values(this.bots)) {
      b.destroy();
    }
  }
}
