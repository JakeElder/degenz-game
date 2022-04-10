import { APIChannelPatchOverwrite } from "discord-api-types/v9";
import { Client, OverwriteResolvable, Permissions } from "discord.js";
import { inspect } from "util";
import { promises as fs } from "fs";
import { BotSymbol } from "data/types";
import Manifest from "manifest";
import Config from "config";

export function json(data: any) {
  return inspect(data, {
    colors: process.stdout.isTTY,
    depth: null,
    maxArrayLength: null,
  });
}

export function resolvableToOverwrite(
  resolvable: OverwriteResolvable
): APIChannelPatchOverwrite {
  const bits = {
    deny: ((resolvable.deny as (keyof typeof Permissions.FLAGS)[]) || []).map(
      (s) => Permissions.FLAGS[s]
    ),
    allow: ((resolvable.allow as (keyof typeof Permissions.FLAGS)[]) || []).map(
      (s) => Permissions.FLAGS[s]
    ),
  };

  return {
    id: resolvable.id as string,
    type: 0,
    deny: bits.deny.reduce((p, n) => p | n, BigInt(0)).toString(),
    allow: bits.allow.reduce((p, n) => p | n, BigInt(0)).toString(),
  };
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
  symbol: BotSymbol,
  onRateLimit: (ms: number) => void = () => {}
) {
  const bots = await Manifest.bots();

  const bot = bots.find((b) => b.symbol === symbol);

  if (!bot) {
    throw new Error(`Bot ${bot} not found`);
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
    client.login(Config.botToken(bot.symbol));
  });

  return client;
}

/**
 * @description Prints a blank line to console
 */
export function nl() {
  console.log("");
}
