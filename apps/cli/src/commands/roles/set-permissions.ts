import Manifest from "manifest";
import Listr from "listr";
import { Routes } from "discord-api-types/v10";
import Config from "config";
import { Role } from "data/db";
import { Command } from "../../lib";
import { Permissions } from "discord.js";

export default class SetRolePermissions extends Command {
  static description = "Set permissions for roles";

  async run(): Promise<void> {
    const roles = await Role.find();
    const m = await Manifest.roles();

    const listr = new Listr(
      roles.map<Listr.ListrTask>((role) => {
        return {
          title: role.symbol,
          task: async (_, task) => {
            if (role.symbol === "ADMIN_BOT") {
              task.skip("Skipping ADMIN_BOT");
              return;
            }

            const r = m.find((r) => r.symbol === role.symbol);

            if (!r) {
              throw new Error(`Missing manifest entry for ${role.symbol}`);
            }

            const permissions =
              !("permissions" in r) || !r.permissions
                ? Permissions.DEFAULT.toString()
                : r.permissions;

            await this.patch(
              Routes.guildRole(Config.general("GUILD_ID"), role.discordId),
              { permissions },
              Config.botToken("ADMIN"),
              task
            );
          },
        };
      })
    );

    await listr.run();
  }
}
