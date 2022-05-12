import { Client } from "discord.js";
import { inspect } from "util";
import { promises as fs } from "fs";
import Manifest from "manifest";
import Config from "config";
import { NPCSymbol } from "data/types";
import { ManagedChannel } from "data/src";
import { OverwriteData, PermissionOverwrites } from "discord.js";
import merge from "deepmerge";

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
 * @author Some asshole that didn't write comments
 */
export function resolveOverwrites(
  pos: ManagedChannel["permissionOverwrites"]
): OverwriteData[] {
  const flat = pos.flatMap((po) => {
    return po.roles.map((rpo) => {
      return {
        id: Config.roleId(rpo),
        options: po.options,
      };
    });
  });

  const merged = flat.reduce<typeof flat>((p, c) => {
    const i = p.findIndex(({ id }) => id === c.id);
    return i === -1
      ? [...p, c]
      : [...p.slice(0, i), merge(p[i], c), ...p.slice(i + 1)];
  }, []);

  const resolved = merged.map((po) => {
    return {
      id: po.id,
      ...PermissionOverwrites.resolveOverwriteOptions(po.options, {}),
    };
  });

  return resolved;
}

/**
 * @description Prints a blank line to console
 */
export function nl() {
  console.log("");
}
