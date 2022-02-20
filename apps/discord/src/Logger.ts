import { Events } from "./Events";

type Event<T extends keyof Events> = Parameters<Events[T]>[0];

export default class Logger {
  static botReady(e: Event<"BOT_READY">) {
    console.log(`${e.type}: ${e.data.bot.name}`);
  }

  static commandNotFound(e: Event<"COMMAND_NOT_FOUND">) {
    console.error(`${e.type}: ${e.data.i.commandName}`);
  }

  static commandNotImplemented(e: Event<"COMMAND_NOT_IMPLEMENTED">) {
    console.error(`${e.type}: ${e.data.i.commandName}`);
  }

  static sendMessageAsExecuted(e: Event<"SEND_MESSAGE_AS_EXECUTED">) {
    console.log(
      `${e.type}: ${e.data.bot.name} : #${e.data.channel.name} : "${e.data.message}"`
    );
  }
}
