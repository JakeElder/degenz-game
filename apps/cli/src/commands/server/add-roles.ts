import { roles } from "manifest";
import Listr from "listr";
import { Routes } from "discord-api-types/v9";
import Config from "config";
import {
  BaseRole,
  CitizenRole,
  CitizenRoleSymbol,
  RoleSymbol,
} from "data/types";
import { connect, disconnect, Role } from "data/db";
import { Flags } from "@oclif/core";
import path from "path";
import { promises as fs } from "fs";
import Color from "color";
import { Command } from "../../lib";
import { json } from "../../utils";

async function exists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export default class AddRoles extends Command {
  static description = "Add citizen roles";

  static flags = {
    base: Flags.boolean({ default: async (o) => !o.flags.citizen }),
    citizen: Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AddRoles);

    const ROLE_IDS: Partial<Record<RoleSymbol | CitizenRoleSymbol, string>> =
      {};

    if (flags.base) {
      await connect();
      const baseRoles = roles.filter(
        (r): r is BaseRole => !("managed" in r) && !("citizen" in r)
      );
      const listr = new Listr(
        baseRoles.map<Listr.ListrTask>((role) => {
          return {
            title: role.name,
            task: async () => {
              const res = await this.post(
                Routes.guildRoles(Config.general("GUILD_ID")),
                {
                  name: role.name,
                  permissions: role.permissions,
                },
                Config.botToken("ADMIN")
              );
              ROLE_IDS[role.symbol] = res.data.id;
            },
          };
        })
      );
      await listr.run();
      this.log(json({ ROLE_IDS }));
    } else {
      const baseRoles = roles.filter((r): r is CitizenRole => "citizen" in r);

      const listr = new Listr(
        baseRoles.map<Listr.ListrTask>((role) => {
          return {
            title: role.name,
            task: async () => {
              const file = path.join(
                __dirname,
                `../../images/roles/${role.symbol}.png`
              );
              const iconExists = await exists(file);

              if (!iconExists) {
                throw new Error(`No icon for ${role.symbol}`);
              }

              const icon = await fs.readFile(file, { encoding: "base64" });

              const res = await this.post(
                Routes.guildRoles(Config.general("GUILD_ID")),
                {
                  name: role.name,
                  color: Color(role.color).rgbNumber(),
                  ...(Config.env("NODE_ENV") !== "development"
                    ? {
                        icon: `data:image/png;base64,${icon}`,
                      }
                    : {}),
                },
                Config.botToken("ADMIN")
              );

              await Role.insert({
                type: "CITIZEN",
                symbol: role.symbol,
                discordId: res.data.id,
              });
            },
          };
        })
      );

      await connect();
      await listr.run();
      await disconnect();
    }
  }
}
