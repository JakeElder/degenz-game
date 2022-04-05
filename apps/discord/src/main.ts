import cleanup from "node-cleanup";
import PrettyError from "pretty-error";
import { connect, disconnect } from "data/db";
import Utils from "./Utils";
import Runner from "./Runner";
import * as Bots from "./bots";
import { Global } from "./Global";
import Config from "config";
import Manifest from "manifest";
import { Bot, BotSymbol } from "data/types";

const pe = new PrettyError();

["uncaughtException", "unhandledRejection"].forEach((e) =>
  process.on(e, (e) => {
    Utils.rollbar.error(e);
    console.error(pe.render(e));
  })
);

cleanup((_, signal) => {
  if (signal) {
    if (runner) {
      runner.destroy();
    }
    disconnect().then(() => {
      process.kill(process.pid, signal);
      return false;
    });
  }
});

let runner: Runner;

function d(descriptors: Bot[], symbol: BotSymbol) {
  return descriptors.find((bot) => bot.symbol === symbol)!;
}

async function main() {
  await connect();
  await Config.load();

  const ds = await Manifest.bots();

  Global.bot("ADMIN", new Bots.AdminBot(d(ds, "ADMIN")));
  Global.bot("ALLY", new Bots.AllyBot(d(ds, "ALLY")));
  Global.bot("BANKER", new Bots.BankerBot(d(ds, "BANKER")));
  Global.bot("BIG_BROTHER", new Bots.BigBrotherBot(d(ds, "BIG_BROTHER")));
  Global.bot("MART_CLERK", new Bots.MartClerkBot(d(ds, "MART_CLERK")));
  Global.bot("PRISONER", new Bots.PrisonerBot(d(ds, "PRISONER")));
  Global.bot("TOSSER", new Bots.TosserBot(d(ds, "TOSSER")));
  Global.bot("WARDEN", new Bots.WardenBot(d(ds, "WARDEN")));

  if (Config.env("NODE_ENV") === "development" && Config.general("USE_SCOUT")) {
    Global.bot("SCOUT", new Bots.ScoutBot(d(ds, "SCOUT")));
  }

  runner = new Runner(Global.bots());
}

main();
