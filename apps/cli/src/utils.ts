import { APIChannelPatchOverwrite } from "discord-api-types/v9";
import { OverwriteResolvable, Permissions } from "discord.js";
import { inspect } from "util";

export function json(data: any) {
  return inspect(data, { colors: false });
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
