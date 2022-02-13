import { Events } from "./Events";

type EventData<T extends keyof Events> = Parameters<Events[T]>[0];

export default class Logger {
  static botReady(data: EventData<"BOT_READY">) {
    console.log(`BOT_READY: ${data.bot.name}`);
  }
}
