import { roles } from "manifest";
import Listr from "listr";
import { Routes } from "discord-api-types/v9";
import Config from "config";
import { RoleSymbol } from "data/types";
import { Command } from "../../lib";
import { json } from "../../utils";

export default class Roles extends Command {
  static description = "Get server roles";

  async run(): Promise<void> {
    const ROLE_IDS: Partial<Record<RoleSymbol, string>> = {};

    const listr = new Listr(
      roles
        .filter((r) => !r.managed)
        .map<Listr.ListrTask>((role) => {
          return {
            title: role.name!,
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
  }
}
