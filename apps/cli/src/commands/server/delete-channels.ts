import { CliUx } from "@oclif/core";
import { Routes } from "discord-api-types/v9";
import Listr from "listr";
import { Command } from "../../lib";
import _ from "discord.js";
import Config from "app-config";

export default class DeleteChannels extends Command {
  static description = "Delete categories and channels";

  async run(): Promise<void> {
    const res = await this.get(
      Routes.guildChannels(Config.general("GUILD_ID")),
      Config.botToken("ADMIN")
    );

    const cnfrm = await CliUx.ux.prompt(
      `Deleting ${res.data.length} channels. Are you sure? Y/n`
    );

    if (cnfrm !== "Y") {
      return;
    }

    const listr = new Listr(
      res.data.map((c: any) => {
        return {
          title: c.name,
          task: async (_, task) => {
            await this.delete(
              Routes.channel(c.id),
              Config.botToken("ADMIN"),
              task
            );
          },
        } as Listr.ListrTask;
      }),
      { concurrent: true }
    );

    await listr.run();
  }
}
