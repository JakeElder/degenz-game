import { BotSymbol } from "types";
import Events from "./Events";
import Logger from "./Logger";
import WorldNotifier from "./WorldNotifier";
import DiscordBot from "./DiscordBot";
import OnboardController from "./controllers/OnboardController";
import AppController from "./controllers/AppController";

export default class Runner {
  constructor(private bots: DiscordBot[]) {
    this.bindEventHandlers();
  }

  private bindEventHandlers() {
    Events.on("BOT_READY", (e) => {
      Logger.botReady(e);

      if (e.data.bot.symbol === "BIG_BROTHER") {
        AppController.setEnterMessage();
        AppController.setVerifyMessage();
        AppController.setLeaderboardMessage();
      }
    });

    Events.on("BALANCE_CHECKED", (e) => {
      WorldNotifier.balanceChecked(e);
    });

    Events.on("COMMAND_NOT_FOUND", (e) => {
      Logger.commandNotFound(e);
    });

    Events.on("COMMAND_NOT_IMPLEMENTED", (e) => {
      Logger.commandNotImplemented(e);
    });

    Events.on("SEND_MESSAGE_AS_EXECUTED", async (e) => {
      Logger.sendMessageAsExecuted(e);
    });

    Events.on("APARTMENT_ALLOCATED", async (e) => {
      OnboardController.partOne(e.data.user);
    });
  }

  get(symbol: BotSymbol) {
    const bot = this.bots.find((b) => b.manifest.symbol === symbol);
    if (!bot) {
      throw new Error(`Bot not found ${symbol}`);
    }
    return bot;
  }

  destroy() {
    for (let b of this.bots) {
      b.destroy();
    }
  }
}
