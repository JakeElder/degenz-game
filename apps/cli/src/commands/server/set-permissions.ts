import { Routes } from "discord-api-types/v9";
import Listr from "listr";
import { Command } from "../../lib";
import Manifest from "manifest";
import Config from "config";
import { resolvableToOverwrite } from "../../utils";
import { OverwriteResolvable } from "discord.js";

export default class SetPermissions extends Command {
  static description = "Set category and channel permissions";

  async run(): Promise<void> {
    const structure = await Manifest.structure();

    const token = Config.botToken("ADMIN");

    const listr = new Listr(
      structure.map<Listr.ListrTask>((category) => {
        return {
          title: `Category: ${category.name}`,
          task: async (_, task) => {
            const categoryId = Config.categoryId(category.symbol);
            await this.patch(
              Routes.channel(categoryId),
              {
                permission_overwrites: category.permissionOverwrites.map(
                  resolvableToOverwrite
                ),
              },
              token,
              task
            );

            return new Listr(
              category.channels.map<Listr.ListrTask>((channel) => {
                return {
                  title: channel.name,
                  task: async (_, task) => {
                    const channelId = Config.channelId(channel.symbol);

                    const o: OverwriteResolvable[] = [
                      ...channel.permissionOverwrites,
                    ];

                    if (channel.lockPermissions) {
                      o.unshift(...category.permissionOverwrites);
                    }

                    await this.patch(
                      Routes.channel(channelId),
                      { permission_overwrites: o.map(resolvableToOverwrite) },
                      token,
                      task
                    );
                  },
                };
              })
            );
          },
        };
      }),
      { concurrent: true, exitOnError: false }
    );

    await listr.run();
  }
}
