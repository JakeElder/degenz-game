import { Flags } from "@oclif/core";
import { Routes } from "discord-api-types/v9";
import Listr from "listr";
import { Command } from "../../lib";
import { structure, Config } from "discord-config";
import _ from "discord.js";
import { resolvableToOverwrite } from "../../utils";

export default class SetPermissions extends Command {
  static description = "Set category and channel permissions";

  static flags = {
    token: Flags.string({
      description: "The authentication token",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(SetPermissions);

    const listr = new Listr(
      structure.map((category) => {
        return {
          title: `Category: ${category.name}`,
          task: async () => {
            const categoryId = Config.get(`${category.id}_ID` as any) as string;
            await this.patch(
              Routes.channel(categoryId),
              {
                permission_overwrites: category.permissionOverwrites.map(
                  resolvableToOverwrite
                ),
              },
              flags.token
            );

            return new Listr(
              category.channels.map((channel) => {
                return {
                  title: channel.name,
                  task: async () => {
                    const channelId = Config.get(
                      `${channel.id}_ID` as any
                    ) as string;

                    await this.patch(
                      Routes.channel(channelId),
                      {
                        permission_overwrites: (channel.lockPermissions
                          ? category
                          : channel
                        ).permissionOverwrites.map(resolvableToOverwrite),
                      },
                      flags.token
                    );

                    if (channel.lockPermissions) {
                      await Promise.all(
                        channel.permissionOverwrites.map((o) => {
                          const { id, type, deny, allow } =
                            resolvableToOverwrite(o);
                          return this.put(
                            Routes.channelPermission(channelId, id),
                            { type, deny, allow },
                            flags.token
                          );
                        })
                      );
                    }
                  },
                };
              }),
              { concurrent: true }
            );
          },
        };
      }),
      { concurrent: true }
    );

    await listr.run();
  }
}
