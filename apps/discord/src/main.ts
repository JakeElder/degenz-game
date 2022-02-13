import cleanup from "node-cleanup";
import PrettyError from "pretty-error";
import Runner from "./Runner";
import EventHandler from "./EventHandler";
import * as bots from "./bots/index";

const pe = new PrettyError();

function handleUncaught(e: Error) {
  // rollbar.error(e);
  console.error(pe.render(e));
}

process.on("uncaughtException", handleUncaught);
process.on("unhandledRejection", handleUncaught);

cleanup(() => {
  runner.destroy();
  console.log("Running cleanup");
});

const runner = new Runner();

async function main() {
  const eventHandler = new EventHandler();
  runner.add(new bots.Admin());
}

main();
