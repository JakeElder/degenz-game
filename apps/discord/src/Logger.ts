import { Events } from "./Events";

type EventData<T extends keyof Events> = Parameters<Events[T]>[0];

export default class Logger {
  static botReady(e: EventData<"BOT_READY">) {
    console.log(`BOT_READY: ${e.bot.name}`);
  }

  static commandNotFound(e: EventData<"COMMAND_NOT_FOUND">) {
    console.error(`COMMAND_NOT_FOUND: ${e.i.commandName}`);
  }

  static commandNotImplemented(e: EventData<"COMMAND_NOT_IMPLEMENTED">) {
    console.error(`COMMAND_NOT_IMPLEMENTED: ${e.i.commandName}`);
  }

  static sendMessageRequest(e: EventData<"SEND_MESSAGE_REQUEST">) {
    console.log(
      `SEND_MESSAGE_REQUEST: ${e.bot.name} : #${e.channel.name} : "${e.message}"`
    );
  }
}
