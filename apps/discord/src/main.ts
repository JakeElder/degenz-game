import cleanup from "node-cleanup";
import PrettyError from "pretty-error";
import Config from "app-config";
import { connect, disconnect } from "db";
import Runner from "./Runner";
import * as bots from "./bots";
import { Global } from "./Global";

const pe = new PrettyError();

["uncaughtException", "unhandledRejection"].forEach((e) =>
  process.on(e, (e) => {
    console.error(pe.render(e));
  })
);

cleanup(function (_, signal) {
  if (signal) {
    if (runner) {
      runner.destroy();
    }
    console.log("DISCONNECTING");
    disconnect().then(() => {
      process.kill(process.pid, signal);
      return false;
    });
  }
});

let runner: Runner;

async function main() {
  console.log("CONNECTING", Config.env("DB_CONN_STRING"));
  await connect(Config.env("DB_CONN_STRING"));
  console.log("CONNECTED");

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
