import Config from "app-config";
import delay from "delay";
import { renderToStaticMarkup } from "react-dom/server";
import TurndownService from "turndown";
import { Connection } from "typeorm";
import { AdminBot } from "./bots";

TurndownService.prototype.escape = (s) => s;
const td = new TurndownService();

export default class Utils {
  static admin: AdminBot;
  static connection: Connection;

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

  static su(bot?: AdminBot) {
    if (bot) {
      Utils.admin = bot;
    }

    if (!Utils.admin) {
      throw new Error("Admin bot not set");
    }

    return Utils.admin;
  }

  static r(e: React.ReactElement) {
    const md = td.turndown(renderToStaticMarkup(e));
    return md;
  }
}
