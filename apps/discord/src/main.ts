import cleanup from "node-cleanup";
import PrettyError from "pretty-error";
import Config from "app-config";
import { connect, disconnect } from "data/db";
import Utils from "./Utils";
import Runner from "./Runner";
import * as bots from "./bots";
import { Global } from "./Global";

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

async function main() {
  await connect();

  Global.bot("ADMIN", new bots.AdminBot());
  Global.bot("ALLY", new bots.AllyBot());
  Global.bot("BANKER", new bots.BankerBot());
  Global.bot("BIG_BROTHER", new bots.BigBrotherBot());
  Global.bot("MART_CLERK", new bots.MartClerkBot());
  Global.bot("PRISONER", new bots.PrisonerBot());
  Global.bot("TOSSER", new bots.TosserBot());
  Global.bot("WARDEN", new bots.WardenBot());

  runner = new Runner(Global.bots());
}

main();
