import Events from "./Events";
import Logger from "./Logger";
import WorldNotifier from "./WorldNotifier";
import DiscordBot from "./DiscordBot";
import OnboardController from "./controllers/OnboardController";
import AppController from "./controllers/AppController";
import HallOfAllegianceController from "./controllers/HallOfAllegianceController";
import Analytics from "./Analytics";
import UserController from "./controllers/UserController";
import WelcomeRoomController from "./controllers/WelcomeRoomController";
import QuestsController from "./controllers/QuestsController";
import { LeaderboardController } from "./controllers/LeaderboardController";
import MartClerkCommandController from "./command-controllers/MartClerkCommandController";
import NextStepController from "./controllers/NextStepsController";
import EntranceController from "./controllers/EntranceController";
import QuestLogController from "./controllers/QuestLogController";
import { NPCSymbol } from "data/types";
import AnnouncementController from "./controllers/AnnouncementController";
import TossV2Controller from "./controllers/TossV2Controller";
import GetPFPController from "./controllers/GetPFPController";

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

      if (e.data.bot.id === "ADMIN") {
        AppController.init();
        OnboardController.bindEventListeners();
        QuestsController.init();
        QuestLogController.init();
        UserController.init();
        AnnouncementController.init();
      }

      if (e.data.bot.id === "BIG_BROTHER") {
        HallOfAllegianceController.init();
        LeaderboardController.init();
        EntranceController.init();
      }

      if (e.data.bot.id === "MART_CLERK") {
        MartClerkCommandController.init();
      }

      if (e.data.bot.id === "TOSSER") {
        TossV2Controller.init();
      }

      if (e.data.bot.id === "ALLY") {
        NextStepController.init();
        GetPFPController.init();
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
        OnboardController.sendInitialMessage(e.data.user);
      } else {
        OnboardController.skip(e.data.user);
      }
    });

    Events.on("DORMITORY_ALLOCATED", (e) => {
      if (e.data.onboard) {
        OnboardController.sendInitialMessage(e.data.user);
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

    // Events.on("MEMBER_VERIFIED", async (e) => {
    //   WorldNotifier.memberVerified(e);
    //   await UserController.add(e.data.member);
    //   WelcomeRoomController.welcome(e.data.member);
    //   Analytics.verify(e);
    // });

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
      WelcomeRoomController.welcome(e.data.user);
    });

    Events.on("FIRST_WORLD_CHOICE", (e) => {
      Analytics.firstWorldChoice(e);
    });

    Events.on("ACHIEVEMENT_AWARDED", (e) => {
      WorldNotifier.achievementAwarded(e);
      Analytics.achievementAwarded(e);
    });

    Events.on("QUEST_COMPLETED", (e) => {
      WorldNotifier.questCompleted(e);
      QuestLogController.refresh(e.data.user);
    });

    Events.on("DORM_READY_BUTTON_PRESSED", (e) => {
      Analytics.dormReadyButtonPressed(e);
    });

    Events.on("ONBOARDING_THREAD_PURGED", (e) => {
      Analytics.onboardingThreadPurged(e);
    });

    Events.on("TOKENS_CONFISCATED", (e) => {
      Analytics.tokensConfiscated(e);
    });

    Events.on("TOKENS_ISSUED", (e) => {
      Analytics.tokensIssued(e);
    });

    Events.on("CITIZEN_IMPRISONED", (e) => {
      Analytics.citizenImprisoned(e);
      WorldNotifier.citizenImprisoned(e);
    });

    Events.on("CITIZEN_ESCAPED", (e) => {
      Analytics.citizenEscaped(e);
      WorldNotifier.citizenEscaped(e);
    });

    Events.on("CITIZEN_RELEASED", (e) => {
      Analytics.citizenReleased(e);
      WorldNotifier.citizenReleased(e);
    });

    Events.on("REACTIONS_REWARDED", (e) => {
      WorldNotifier.reactionsRewarded(e);
    });
  }

  get(symbol: NPCSymbol) {
    const bot = this.bots.find((b) => b.npc.id === symbol);
    if (!bot) {
      throw new Error(`Bot not found ${symbol}`);
    }
    return bot;
  }

  destroy() {
    for (let b of this.bots) {
      console.log(`SHUTTING_DOWN: ${b.npc.id}`);
      b.destroy();
    }
  }
}
