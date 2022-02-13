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
    token: Flags.string({
      description: "The authentication token",
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
            return new Listr(
              bot.commands.map((command) => {
                return {
                  title: command.id,
                  task: async () => {
                    const res = await this.put(
                      Routes.applicationGuildCommands(
                        Config.clientId(bot.id),
                        flags["id"]
                      ),
                      [
                        {
                          ...command.data,
                          default_permission: command.permissions.length === 0,
                        },
                      ],
                      flags.token
                    );

                    if (command.permissions.length) {
                      await this.put(
                        Routes.applicationCommandPermissions(
                          Config.clientId(bot.id),
                          flags["id"],
                          res.data[0].id
                        ),
                        { permissions: command.permissions },
                        flags.token
                      );
                    }
                  },
                };
              })
            );
          },
        };
      })
    );

    await listr.run();
  }
}
