import { BotId } from "types";
import Events from "./Events";
import Logger from "./Logger";
import DiscordBot from "./DiscordBot";
import OnboardController from "./controllers/OnboardController";
import AppController from "./controllers/AppController";

export default class Runner {
  constructor(private bots: DiscordBot[]) {
    this.bindEventHandlers();
  }

  private bindEventHandlers() {
    Events.on("BOT_READY", (data) => {
      Logger.botReady(data);
      if (data.bot.id === "BIG_BROTHER") {
        AppController.setEnterMessage();
      }
    });

    Events.on("COMMAND_NOT_FOUND", (data) => {
      Logger.commandNotFound(data);
    });

    Events.on("COMMAND_NOT_IMPLEMENTED", (data) => {
      Logger.commandNotImplemented(data);
    });

    Events.on("SEND_MESSAGE_REQUEST", async (data) => {
      Logger.sendMessageRequest(data);
      const bot = this.get(data.bot.id);

      if (bot) {
        const channel = await bot.getTextChannel(data.channel.id);
        await channel.send(data.message);
        data.done(true);
      } else {
        data.done(false);
      }
    });

    Events.on("APARTMENT_ALLOCATED", async (data) => {
      OnboardController.partOne(data.user);
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
