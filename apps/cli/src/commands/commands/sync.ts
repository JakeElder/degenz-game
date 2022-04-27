import Manifest from "manifest";
import { Routes } from "discord-api-types/v10";
import { Command } from "../../lib";
import Config from "config";
import { REST } from "@discordjs/rest";

export default class SyncCommands extends Command {
  static description = "Sync Commands";

  async run(): Promise<void> {
    const { npcs } = await Manifest.load();

    const syncs = npcs.filter(
      (npc) =>
        !["SENSEI", "SCOUT", "DEVILS_ADVOCATE", "ARMORY_CLERK"].includes(npc.id)
    );

    const progress = this.getProgressBar(syncs.map((c) => c.id));
    // progress.start();

    await Promise.all(
      syncs.map(async (npc) => {
        const route = Routes.applicationGuildCommands(
          Config.clientId(npc.id),
          Config.env("GUILD_ID")
        );

        const data = npc.commands.map((c) => {
          return {
            ...c.data,
            default_permission: c.permissions.length === 0,
          };
        });

        const rest = new REST({ version: "10" }).setToken(
          Config.botToken(npc.id)
        );

        const res: any = await rest.put(route, { body: data });

        await Promise.all(
          res
            .filter((d: any) => !d.default_permission)
            .map((d: any, idx: number) => {
              const route = Routes.applicationCommandPermissions(
                Config.clientId(npc.id),
                Config.env("GUILD_ID"),
                d.id
              );

              const cmd = npc.commands.find((c) => c.data.name === d.name)!;
              const permissions = cmd.permissions.map((p) => ({
                ...p,
                id: Config.roleId(p.id),
              }));

              console.log(npc.id, d.name, permissions);

              return rest.put(route, { body: { permissions } });
            })
        );

        // progress.complete(npc.id);
      })
    );
  }
}
