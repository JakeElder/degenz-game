import { Command as OclifCommand } from "@oclif/core";
import { connect, disconnect } from "data/db";
import { NPCSymbol } from "data/types";
import Manifest from "manifest";
import prompts from "prompts";
import { Client, Guild } from "discord.js";
import Config from "config";
import { ProgressBar } from ".";

type AugmentedClient = Client & {
  onRateLimit: (ms: number) => void;
  guild: Guild;
};

export default abstract class Command extends OclifCommand {
  progressBars: ProgressBar[] = [];
  bots: AugmentedClient[] = [];

  async init() {
    await connect();
    await Config.load();
  }

  async finally(err?: Error) {
    for (let i = 0; i < this.progressBars.length; i++) {
      this.progressBars[i].stop();
    }

    for (let i = 0; i < this.bots.length; i++) {
      this.bots[i].destroy();
    }

    await disconnect();
    return super.finally(err);
  }

  async confirm(message: string) {
    const response = await prompts([
      {
        type: "toggle",
        name: "cancel",
        message,
        initial: false,
        active: "No",
        inactive: "Yes",
      },
    ]);

    if (response.cancel === undefined) {
      return false;
    }

    return !response.cancel;
  }

  async bot(symbol: NPCSymbol): Promise<AugmentedClient> {
    const { npcs } = await Manifest.load();
    const npc = npcs.find((b) => b.id === symbol);

    if (!npc) {
      throw new Error(`Bot ${symbol} not found`);
    }

    const client = new Client(npc.clientOptions);

    await new Promise((resolve) => {
      client.once("ready", resolve);
      client.on("apiResponse", async (_req, res) => {
        if (res.status === 429) {
          const rl = parseInt(res.headers.get("retry-after")!, 10) * 1000;
          augmentedClient.onRateLimit(rl);
        }
      });
      client.on("rateLimit", (rl) => {
        augmentedClient.onRateLimit(rl.timeout);
      });
      client.login(Config.botToken(npc.id));
    });

    const augmentedClient: AugmentedClient = Object.assign(
      Object.create(client),
      {
        onRateLimit: () => {},
        guild: await client.guilds.fetch(Config.env("GUILD_ID")),
      }
    );

    this.bots.push(augmentedClient);

    return augmentedClient;
  }

  getProgressBar<T extends string = string>(symbols: T[]) {
    const progress = new ProgressBar<T>(symbols);
    this.progressBars.push(progress);
    return progress;
  }

  done() {
    console.log("✅ Done");
  }

  cancelled() {
    console.log("✅ Cancelled");
  }
}
