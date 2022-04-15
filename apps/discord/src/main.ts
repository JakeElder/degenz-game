import cleanup from "node-cleanup";
import PrettyError from "pretty-error";
import { connect, disconnect, NPC } from "data/db";
import Utils from "./Utils";
import Runner from "./Runner";
import * as Bots from "./bots";
import { Global } from "./Global";
import Config from "config";
import Manifest from "manifest";
import { NPCSymbol } from "data/types";

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
let npcs: NPC[];

function npc(id: NPCSymbol) {
  const n = npcs.find((npc) => npc.id === id);
  if (!n) {
    throw new Error(`${id} npc not found.`);
  }
  return n;
}

async function main() {
  await connect();
  await Config.load();

  ({ npcs } = await Manifest.load());

  Global.bot("ADMIN", new Bots.AdminBot(npc("ADMIN")));
  Global.bot("ALLY", new Bots.AllyBot(npc("ALLY")));
  Global.bot("BANKER", new Bots.BankerBot(npc("BANKER")));
  Global.bot("BIG_BROTHER", new Bots.BigBrotherBot(npc("BIG_BROTHER")));
  Global.bot("MART_CLERK", new Bots.MartClerkBot(npc("MART_CLERK")));
  Global.bot("PRISONER", new Bots.PrisonerBot(npc("PRISONER")));
  Global.bot("TOSSER", new Bots.TosserBot(npc("TOSSER")));
  Global.bot("WARDEN", new Bots.WardenBot(npc("WARDEN")));

  if (Config.env("NODE_ENV") === "development" && Config.general("USE_SCOUT")) {
    Global.bot("SCOUT", new Bots.ScoutBot(npc("SCOUT")));
  }

  runner = new Runner(Global.bots());
}

main();
