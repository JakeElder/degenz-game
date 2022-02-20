import { Flags } from "@oclif/core";
import { Routes } from "discord-api-types/v9";
import { bots } from "manifest";
import Listr from "listr";
import Config from "app-config";
import { Command } from "../../lib";
import _ from "discord.js";

export default class DeleteCommands extends Command {
  static description = "Delete application commands";

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
    const { flags } = await this.parse(DeleteCommands);

    const listr = new Listr(
      bots.map((bot) => {
        return {
          title: bot.name,
          task: async () => {
            await this.put(
              Routes.applicationGuildCommands(
                Config.clientId(bot.symbol),
                flags.id
              ),
              [],
              flags.token
            );
          },
        };
      }),
      { concurrent: true }
    );

    await listr.run();
  }
}
