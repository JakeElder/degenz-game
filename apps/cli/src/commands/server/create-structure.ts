import { Flags } from "@oclif/core";
import { Routes, ChannelType } from "discord-api-types/v9";
import Listr from "listr";
import { Command } from "../../lib";
import { structure } from "manifest";
import _ from "discord.js";
import { json, resolvableToOverwrite } from "../../utils";
import { CategoryId, ChannelId } from "types";

export default class CreateStructure extends Command {
  static description = "Create categories and channels";

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
    const { flags } = await this.parse(CreateStructure);

    const CATEGORY_IDS: Partial<Record<CategoryId, string>> = {};
    const CHANNEL_IDS: Partial<Record<ChannelId, string>> = {};

    const listr = new Listr(
      structure.map((category) => {
        return {
          title: `Category: ${category.name}`,
          task: async () => {
            const res = await this.post(
              Routes.guildChannels(flags["id"]),
              {
                type: ChannelType.GuildCategory,
                name: category.name,
                permission_overwrites: category.permissionOverwrites.map(
                  resolvableToOverwrite
                ),
              },
              flags.token
            );

            CATEGORY_IDS[category.id] = res.data.id;

            return new Listr(
              category.channels.map((channel) => {
                return {
                  title: channel.name,
                  task: async () => {
                    const r = await this.post(
                      Routes.guildChannels(flags["id"]),
                      {
                        type: ChannelType.GuildText,
                        name: channel.name,
                        parent_id: res.data.id,
                        permission_overwrites: (channel.lockPermissions
                          ? category
                          : channel
                        ).permissionOverwrites.map(resolvableToOverwrite),
                      },
                      flags.token
                    );

                    CHANNEL_IDS[channel.id] = r.data.id;

                    if (channel.lockPermissions) {
                      await Promise.all(
                        channel.permissionOverwrites.map((o) => {
                          const { id, type, deny, allow } =
                            resolvableToOverwrite(o);
                          return this.put(
                            Routes.channelPermission(r.data.id, id),
                            { type, deny, allow },
                            flags.token
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
      })
    );

    await listr.run();

    this.log(json({ CATEGORY_IDS, CHANNEL_IDS }));
  }
}
