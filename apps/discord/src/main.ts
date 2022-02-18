import cleanup from "node-cleanup";
import PrettyError from "pretty-error";
import Config from "app-config";
import { connect, disconnect } from "db";
import Runner from "./Runner";
import * as bots from "./bots";
import Utils from "./Utils";

const pe = new PrettyError();

["uncaughtException", "unhandledRejection"].forEach((e) =>
  process.on(e, (e) => {
    console.error(pe.render(e));
  })
);

cleanup(() => {
  console.log("Running cleanup");
  runner.destroy();
  disconnect();
});

const runner = new Runner();

async function main() {
  const db = await connect(Config.env("DB_CONN_STRING"));
  Utils.db(db);

  const admin = new bots.AdminBot(runner);
  Utils.su(admin);

  runner.add(admin);
  runner.add(new bots.AllyBot(runner));
  runner.add(new bots.BankerBot(runner));
  runner.add(new bots.BigBrotherBot(runner));
  runner.add(new bots.MartClerkBot(runner));
  runner.add(new bots.PrisonerBot(runner));
  runner.add(new bots.TosserBot(runner));
  runner.add(new bots.WardenBot(runner));
}

main();
