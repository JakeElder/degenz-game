import { Routes } from "discord-api-types/v9";
import Manifest from "manifest";
import Listr from "listr";
import Config from "config";
import { Command } from "../../lib";

export default class DeleteCommands extends Command {
  static description = "Delete application commands";

  async run(): Promise<void> {
    const bots = await Manifest.bots();

    const listr = new Listr(
      bots.map<Listr.ListrTask>((bot) => {
        return {
          title: bot.name,
          task: async (_, task) => {
            await this.put(
              Routes.applicationGuildCommands(
                Config.clientId(bot.symbol),
                Config.general("GUILD_ID")
              ),
              [],
              Config.botToken(bot.symbol),
              task
            );
          },
        };
      }),
      { concurrent: true, exitOnError: false }
    );

    await listr.run();
  }
}
