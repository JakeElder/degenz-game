import { NPCSymbol } from "data/types";
import DiscordBot from "./DiscordBot";

export class Global {
  private static botManifest: Partial<Record<NPCSymbol, DiscordBot>> = {};

  static bot(symbol: NPCSymbol, bot?: DiscordBot) {
    if (bot) {
      this.botManifest[symbol] = bot;
      return bot;
    }

    const b = this.botManifest[symbol];

    if (typeof b === "undefined") {
      throw new Error(`${symbol} not set`);
    }

    return b;
  }

  static bots(...symbols: NPCSymbol[]) {
    if (symbols.length === 0) {
      return Object.values(this.botManifest) as DiscordBot[];
    }

    return symbols.map((id) => this.bot(id));
  }
}
