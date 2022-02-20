import { BotSymbol } from "types";
import DiscordBot from "./DiscordBot";

export class Global {
  private static botManifest: Partial<Record<BotSymbol, DiscordBot>> = {};

  static bot(symbol: BotSymbol, bot?: DiscordBot) {
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

  static bots(...symbols: BotSymbol[]) {
    if (!symbols) {
      return Object.values(this.botManifest);
    }

    return symbols.map((id) => this.bot(id));
  }
}
