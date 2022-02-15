import cleanup from "node-cleanup";
import PrettyError from "pretty-error";
import Config from "app-config";
import Runner from "./Runner";
import * as bots from "./bots";
import { connect, disconnect } from "./legacy/db";
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
  await connect(Config.env("MONGO_URI"));
  const admin = new bots.AdminBot(runner);
  Utils.su(admin);

  runner.add(admin);
  runner.add(new bots.BigBrotherBot(runner));
  runner.add(new bots.AllyBot(runner));
  runner.add(new bots.TosserBot(runner));
}

main();
