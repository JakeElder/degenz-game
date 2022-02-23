import Config from "app-config";
import delay from "delay";
import { renderToStaticMarkup } from "react-dom/server";
import TurndownService from "turndown";
import { Connection } from "typeorm";
import Rollbar from "rollbar";

TurndownService.prototype.escape = (s) => s;
const td = new TurndownService();

export default class Utils {
  static connection: Connection;

  static rollbar = new Rollbar({
    accessToken: Config.env("ROLLBAR_TOKEN"),
    environment: Config.env("NODE_ENV"),
  });

  static async delay(ms: number) {
    if (Config.general("SKIP_DELAY")) {
      return;
    }
    return delay(ms);
  }

  static db(connection?: Connection) {
    if (connection) {
      Utils.connection = connection;
    }

    if (!Utils.connection) {
      throw new Error("Connetion not set");
    }

    return Utils.connection;
  }

  static r(e: React.ReactElement) {
    const md = td.turndown(renderToStaticMarkup(e));
    return md;
  }
}
