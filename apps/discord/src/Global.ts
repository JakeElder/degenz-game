import { BotId } from "types";
import DiscordBot from "./DiscordBot";

export class Global {
  private static botManifest: Partial<Record<BotId, DiscordBot>> = {};

  static bot(id: BotId, bot?: DiscordBot) {
    if (bot) {
      this.botManifest[id] = bot;
      return bot;
    }

    const b = this.botManifest[id];

    if (typeof b === "undefined") {
      throw new Error(`${id} not set`);
    }

    return b;
  }

  static bots(...ids: BotId[]) {
    if (!ids) {
      return Object.values(this.botManifest);
    }

    return ids.map((id) => this.bot(id));
  }
}
