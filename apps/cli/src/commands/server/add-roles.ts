import { roles } from "manifest";
import Listr from "listr";
import { Command } from "../../lib";
import { Routes } from "discord-api-types";
import Config from "app-config";

export default class Roles extends Command {
  static description = "Get server roles";

  async run(): Promise<void> {
    const listr = new Listr(
      roles
        .filter((r) => !r.managed)
        .map<Listr.ListrTask>((r) => {
          return {
            title: r.symbol,
            task: async (_, task) => {
              const res = await this.post(
                Routes.guildRoles(Config.general("GUILD_ID")),
                {
                  name: r.name,
                  permissions: r.permissions,
                },
                Config.botToken("ADMIN")
              );
            },
          };
        })
    );

    // const res = await this.post(
    //   Routes.guildRoles(Config.general("GUILD_ID")),
    //   Config.botToken("ADMIN")
    //   {  }
    // );
    // this.log(json(res.data.filter((r) => !r.managed)));
  }
}
