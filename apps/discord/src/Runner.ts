import { BotSymbol } from "types";
import Events from "./Events";
import Logger from "./Logger";
import WorldNotifier from "./WorldNotifier";
import DiscordBot from "./DiscordBot";
import OnboardController from "./controllers/OnboardController";
import AppController from "./controllers/AppController";
import WaitingRoomController from "./controllers/WaitingRoomController";
import HallOfAllegianceController from "./controllers/HallOfAllegianceController";
import Analytics from "./Analytics";

export default class Runner {
  constructor(private bots: DiscordBot[]) {
    this.bindEventHandlers();
  }

  private bindEventHandlers() {
    Events.on("ENTER", (e) => {
      Analytics.enter(e);
    });

    Events.on("BOT_READY", (e) => {
      Logger.botReady(e);

      if (e.data.bot.symbol === "ADMIN") {
        AppController.bindEnterListener();
      }

      if (e.data.bot.symbol === "BIG_BROTHER") {
        WaitingRoomController.init();
        HallOfAllegianceController.init();
        AppController.setVerifyMessage();
        AppController.setLeaderboardMessage();
      }
    });

    Events.on("BALANCE_CHECKED", (e) => {
      WorldNotifier.balanceChecked(e);
      Analytics.balanceChecked(e);
    });

    Events.on("COMMAND_NOT_FOUND", (e) => {
      Logger.commandNotFound(e);
    });

    Events.on("COMMAND_NOT_IMPLEMENTED", (e) => {
      Logger.commandNotImplemented(e);
    });

    Events.on("SEND_MESSAGE_AS_EXECUTED", (e) => {
      Logger.sendMessageAsExecuted(e);
    });

    Events.on("APARTMENT_ALLOCATED", (e) => {
      if (e.data.onboard) {
        OnboardController.partOne(e.data.user);
      } else {
        OnboardController.skip(e.data.user);
      }
    });

    Events.on("STATS_CHECKED", (e) => {
      WorldNotifier.statsChecked(e);
      Analytics.statsChecked(e);
    });

    Events.on("INVENTORY_CHECKED", (e) => {
      WorldNotifier.inventoryChecked(e);
      Analytics.inventoryChecked(e);
    });

    Events.on("ITEM_EATEN", (e) => {
      WorldNotifier.itemEaten(e);
      Analytics.itemEaten(e);
    });

    Events.on("MEMBER_VERIFIED", (e) => {
      WorldNotifier.memberVerified(e);
      Analytics.verify(e);
    });

    Events.on("MART_STOCK_CHECKED", (e) => {
      WorldNotifier.martStockChecked(e);
      Analytics.martStockChecked(e);
    });

    Events.on("MART_ITEM_BOUGHT", (e) => {
      WorldNotifier.martItemBought(e);
      Analytics.martItemBought(e);
    });

    Events.on("TOSS_COMPLETED", (e) => {
      WorldNotifier.tossCompleted(e);
    });

    Events.on("REDPILL_TAKEN", (e) => {
      WorldNotifier.redpillTaken(e);
      Analytics.redpillTaken(e);
    });

    Events.on("HELP_REQUESTED", (e) => {
      WorldNotifier.helpRequested(e);
      Analytics.helpRequested(e);
    });

    Events.on("ALLEGIANCE_PLEDGED", (e) => {
      WorldNotifier.allegiancePledged(e);
    });

    Events.on("GBT_TRANSFERRED", (e) => {
      WorldNotifier.gbtTransferred(e);
      Analytics.gbtTransferred(e);
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
      console.log(`SHUTTING_DOWN: ${b.manifest.symbol}`);
      b.destroy();
    }
  }
}
