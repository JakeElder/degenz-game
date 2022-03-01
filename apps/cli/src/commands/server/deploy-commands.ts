import { Routes } from "discord-api-types/v9";
import { bots } from "manifest";
import Listr from "listr";
import Config from "config";
import { Command } from "../../lib";

export default class DeployCommands extends Command {
  static description = "Deploy application commands";

  async run(): Promise<void> {
    const guildId = Config.general("GUILD_ID");

    const listr = new Listr(
      bots.map<Listr.ListrTask>((bot) => {
        return {
          title: bot.name,
          task: async (_, task) => {
            const data = bot.commands.map((command) => ({
              ...command.data,
              default_permission: command.permissions.length === 0,
            }));

            const res = await this.put(
              Routes.applicationGuildCommands(
                Config.clientId(bot.symbol),
                guildId
              ),
              data,
              Config.botToken(bot.symbol),
              task
            );

            if (res.status === 200) {
              await Promise.all(
                data.map((d, idx) => {
                  if (d.default_permission) {
                    return Promise.resolve();
                  }
                  return this.put(
                    Routes.applicationCommandPermissions(
                      Config.clientId(bot.symbol),
                      guildId,
                      res.data[idx].id
                    ),
                    { permissions: bot.commands[idx].permissions },
                    Config.botToken(bot.symbol),
                    task
                  );
                })
              );
            }
          },
        };
      }),
      { exitOnError: false, concurrent: true }
    );

    await listr.run();
  }
}
