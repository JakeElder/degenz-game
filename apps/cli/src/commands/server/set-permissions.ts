import { Routes } from "discord-api-types/v9";
import Listr from "listr";
import { Command } from "../../lib";
import { structure } from "manifest";
import Config from "config";
import { resolvableToOverwrite } from "../../utils";

export default class SetPermissions extends Command {
  static description = "Set category and channel permissions";

  async run(): Promise<void> {
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
                  task: async (_, ctx) => {
                    const channelId = Config.channelId(channel.symbol);

                    await this.patch(
                      Routes.channel(channelId),
                      {
                        permission_overwrites: (channel.lockPermissions
                          ? category
                          : channel
                        ).permissionOverwrites.map(resolvableToOverwrite),
                      },
                      token,
                      task
                    );

                    if (channel.lockPermissions) {
                      await Promise.all(
                        channel.permissionOverwrites.map((o) => {
                          const { id, type, deny, allow } =
                            resolvableToOverwrite(o);
                          return this.put(
                            Routes.channelPermission(channelId, id),
                            { type, deny, allow },
                            token,
                            task
                          );
                        })
                      );
                    }
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
