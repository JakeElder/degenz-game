import { BotSymbol } from "data/types";
import Events from "./Events";
import Logger from "./Logger";
import WorldNotifier from "./WorldNotifier";
import DiscordBot from "./DiscordBot";
import OnboardController from "./controllers/OnboardController";
import AppController from "./controllers/AppController";
import EnterTheProjectsController from "./controllers/EnterTheProjectsController";
import EnterTheSheltersController from "./controllers/EnterTheSheltersController";
import HallOfAllegianceController from "./controllers/HallOfAllegianceController";
import Analytics from "./Analytics";
import UserController from "./controllers/UserController";
import WelcomeRoomController from "./controllers/WelcomeRoomController";
import { LeaderboardController } from "./controllers/LeaderboardController";
import MartClerkCommandController from "./command-controllers/MartClerkCommandController";

export default class Runner {
  constructor(private bots: DiscordBot[]) {
    this.bindEventHandlers();
  }

  private bindEventHandlers() {
    Events.on("ENTER", (e) => {
      Analytics.enter(e);
    });

    Events.on("EXIT", (e) => {
      Analytics.exit(e);
    });

    Events.on("BOT_READY", (e) => {
      Logger.botReady(e);

      if (e.data.bot.symbol === "ADMIN") {
        AppController.bindEnterListener();
        WelcomeRoomController.init();
      }

      if (e.data.bot.symbol === "BIG_BROTHER") {
        EnterTheProjectsController.init();
        EnterTheSheltersController.init();
        HallOfAllegianceController.init();
        AppController.setVerifyMessage();
        LeaderboardController.init();
      }

      if (e.data.bot.symbol === "MART_CLERK") {
        MartClerkCommandController.init();
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

    Events.on("DORMITORY_ALLOCATED", (e) => {
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

    Events.on("MEMBER_VERIFIED", async (e) => {
      WorldNotifier.memberVerified(e);
      await UserController.add(e.data.member);
      WelcomeRoomController.welcome(e.data.member);
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
      Analytics.tossCompleted(e);
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
      Analytics.allegiancePledged(e);
    });

    Events.on("GBT_TRANSFERRED", (e) => {
      WorldNotifier.gbtTransferred(e);
      Analytics.gbtTransferred(e);
    });

    Events.on("GAME_ENTERED_APARTMENT", (e) => {
      WorldNotifier.gameEnteredApartment(e);
      Analytics.gameEnteredApartment(e);
    });

    Events.on("GAME_ENTERED_DORMITORY", (e) => {
      WorldNotifier.gameEnteredDormitory(e);
      Analytics.gameEnteredDormitory(e);
    });

    Events.on("FIRST_WORLD_CHOICE", (e) => {
      Analytics.firstWorldChoice(e);
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
