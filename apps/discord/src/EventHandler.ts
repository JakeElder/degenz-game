import Events from "./Events";
import Logger from "./Logger";

export default class EventHandler {
  constructor() {
    Events.on("BOT_READY", (data) => {
      Logger.botReady(data);
    });
  }
}
