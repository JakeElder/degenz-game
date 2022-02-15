import { Flags } from "@oclif/core";
import { Routes } from "discord-api-types/v9";
import { bots } from "manifest";
import Listr from "listr";
import Config from "app-config";
import { Command } from "../../lib";

export default class DeployCommands extends Command {
  static description = "Deploy application commands";

  static flags = {
    id: Flags.string({
      description: "The id of the server",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(DeployCommands);

    const listr = new Listr(
      bots.map((bot) => {
        return {
          title: bot.name,
          task: async () => {
            const data = bot.commands.map((command) => ({
              ...command.data,
              default_permission: command.permissions.length === 0,
            }));

            const res = await this.put(
              Routes.applicationGuildCommands(
                Config.clientId(bot.id),
                flags["id"]
              ),
              data,
              Config.botToken(bot.id)
            );

            if (res.status === 200) {
              await Promise.all(
                data.map((d, idx) => {
                  if (d.default_permission) {
                    return Promise.resolve();
                  }
                  return this.put(
                    Routes.applicationCommandPermissions(
                      Config.clientId(bot.id),
                      flags["id"],
                      res.data[idx].id
                    ),
                    { permissions: bot.commands[idx].permissions },
                    Config.botToken(bot.id)
                  );
                })
              );
            }
          },
        };
      }),
      { concurrent: true }
    );

    await listr.run();
  }
}
