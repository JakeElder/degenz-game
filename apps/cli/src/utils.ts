import { Client } from "discord.js";
import { inspect } from "util";
import { promises as fs } from "fs";
import Manifest from "manifest";
import Config from "config";
import { NPCSymbol } from "data/types";

export function json(data: any) {
  return inspect(data, {
    colors: process.stdout.isTTY,
    depth: null,
    maxArrayLength: null,
  });
}

export async function fileExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function getBot(
  symbol: NPCSymbol,
  onRateLimit: (ms: number) => void = () => {}
) {
  const { npcs } = await Manifest.load();
  const bot = npcs.find((b) => b.id === symbol);

  if (!bot) {
    throw new Error(`Bot ${symbol} not found`);
  }

  const client = new Client(bot.clientOptions);

  await new Promise((resolve) => {
    client.once("ready", resolve);
    client.on("apiResponse", async (_req, res) => {
      if (res.status === 429) {
        const rl = parseInt(res.headers.get("retry-after")!, 10) * 1000;
        onRateLimit(rl);
      }
    });
    client.on("rateLimit", (rl) => {
      onRateLimit(rl.timeout);
    });
    client.login(Config.botToken(bot.id));
  });

  return client;
}

/**
 * @description Prints a blank line to console
 */
export function nl() {
  console.log("");
}
