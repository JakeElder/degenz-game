import Config from "config";
import delay from "delay";
import { renderToStaticMarkup } from "react-dom/server";
import TurndownService from "turndown";
import Rollbar from "rollbar";
import { Channel } from "./Channel";
import { Thread } from "./Thread";
import { ManagedChannelSymbol, NPCSymbol } from "data/types";

TurndownService.prototype.escape = (s) => s;
const td = new TurndownService();

class ManagedChannel {
  static async getOrFail(
    id: ManagedChannelSymbol,
    botSymbol: NPCSymbol = "ADMIN"
  ) {
    return Channel.getOrFail(Config.channelId(id), botSymbol);
  }
}

export default class Utils {
  static Channel = Channel;
  static ManagedChannel = ManagedChannel;
  static Thread = Thread;

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
