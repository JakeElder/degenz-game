import { PickEvent } from "./Events";

export default class Logger {
  static botReady(e: PickEvent<"BOT_READY">) {
    console.log(`${e.type}: ${e.data.bot.name}`);
  }

  static commandNotFound(e: PickEvent<"COMMAND_NOT_FOUND">) {
    console.error(`${e.type}: ${e.data.i.commandName}`);
  }

  static commandNotImplemented(e: PickEvent<"COMMAND_NOT_IMPLEMENTED">) {
    console.error(`${e.type}: ${e.data.i.commandName}`);
  }

  static sendMessageAsExecuted(e: PickEvent<"SEND_MESSAGE_AS_EXECUTED">) {
    console.log(
      `${e.type}: ${e.data.bot.name} : #${e.data.channel.name} : "${e.data.message}"`
    );
  }
}
