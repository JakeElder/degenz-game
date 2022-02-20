import { BotId } from "types";
import Events from "./Events";
import Logger from "./Logger";
import HOPNotifier from "./HOPNotifier";
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

      if (e.data.bot.id === "BIG_BROTHER") {
        HOPNotifier.init();
        AppController.setEnterMessage();
        AppController.setVerifyMessage();
        AppController.setLeaderboardMessage();
      }
    });

    Events.on("BALANCE_CHECKED", (e) => {
      HOPNotifier.balanceChecked(e);
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

  get(id: BotId) {
    const bot = this.bots.find((b) => b.manifest.id === id);
    if (!bot) {
      throw new Error(`Bot not found ${id}`);
    }
    return bot;
  }

  destroy() {
    for (let b of this.bots) {
      b.destroy();
    }
  }
}
