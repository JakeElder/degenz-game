import { BotId } from "types";
import Events from "./Events";
import Logger from "./Logger";
import DiscordBot from "./DiscordBot";
import OnboardController from "./controllers/OnboardController";

export default class Runner {
  private bots: Partial<Record<BotId, DiscordBot>> = {};

  constructor() {
    this.bindEventHandlers();
  }

  private bindEventHandlers() {
    Events.on("BOT_READY", (data) => {
      Logger.botReady(data);
    });

    Events.on("COMMAND_NOT_FOUND", (data) => {
      Logger.commandNotFound(data);
    });

    Events.on("COMMAND_NOT_IMPLEMENTED", (data) => {
      Logger.commandNotImplemented(data);
    });

    Events.on("SEND_MESSAGE_REQUEST", async (data) => {
      Logger.sendMessageRequest(data);
      const bot = this.bots[data.bot.id];

      if (bot) {
        const channel = await bot.getTextChannel(data.channel.id);
        await channel.send(data.message);
        data.done(true);
      } else {
        data.done(false);
      }
    });

    Events.on("APARTMENT_ALLOCATED", async (data) => {
      OnboardController.partOne(data.user, this.bots["BIG_BROTHER"]!);
    });
  }

  add(bot: DiscordBot) {
    this.bots[bot.manifest.id] = bot;
  }

  destroy() {
    for (let b of Object.values(this.bots)) {
      b.destroy();
    }
  }
}
