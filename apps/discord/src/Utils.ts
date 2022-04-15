import Config from "config";
import delay from "delay";
import { renderToStaticMarkup } from "react-dom/server";
import TurndownService from "turndown";
import Rollbar from "rollbar";

TurndownService.prototype.escape = (s) => s;
const td = new TurndownService();

export default class Utils {
  static rollbar = new Rollbar({
    accessToken: Config.env("ROLLBAR_TOKEN"),
    environment: Config.env("NODE_ENV"),
  });

  static async delay(ms: number) {
    if (Config.general("SKIP_DELAY")) {
      return;
    }
    return delay(ms * 0.4);
  }

  static r(e: React.ReactElement) {
    const md = td.turndown(renderToStaticMarkup(e));
    return md;
  }
}
