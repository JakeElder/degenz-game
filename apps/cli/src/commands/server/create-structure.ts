import { Routes, ChannelType } from "discord-api-types/v9";
import Listr from "listr";
import Manifest from "manifest";
import { CategorySymbol, ChannelSymbol } from "data/types";
import Config from "config";
import { Command } from "../../lib";
import { json, resolvableToOverwrite } from "../../utils";

export default class CreateStructure extends Command {
  static description = "Create categories and channels";

  async run(): Promise<void> {
    const structure = await Manifest.structure();

    const CATEGORY_IDS: Partial<Record<CategorySymbol, string>> = {};
    const CHANNEL_IDS: Partial<Record<ChannelSymbol, string>> = {};

    const guildId = Config.general("GUILD_ID");
    const token = Config.botToken("ADMIN");

    const listr = new Listr(
      structure.map<Listr.ListrTask>((category) => {
        return {
          title: `Category: ${category.name}`,
          task: async (_, task) => {
            const res = await this.post(
              Routes.guildChannels(guildId),
              {
                type: ChannelType.GuildCategory,
                name: category.name,
                permission_overwrites: category.permissionOverwrites.map(
                  resolvableToOverwrite
                ),
              },
              token,
              task
            );

            CATEGORY_IDS[category.symbol] = res.data.id;

            return new Listr(
              category.channels.map<Listr.ListrTask>((channel) => {
                return {
                  title: channel.name,
                  task: async (_, task) => {
                    const r = await this.post(
                      Routes.guildChannels(guildId),
                      {
                        type: ChannelType.GuildText,
                        name: channel.name,
                        parent_id: res.data.id,
                        permission_overwrites: (channel.lockPermissions
                          ? category
                          : channel
                        ).permissionOverwrites.map(resolvableToOverwrite),
                      },
                      token,
                      task
                    );

                    CHANNEL_IDS[channel.symbol] = r.data.id;

                    if (channel.lockPermissions) {
                      await Promise.all(
                        channel.permissionOverwrites.map((o) => {
                          const { id, type, deny, allow } =
                            resolvableToOverwrite(o);
                          return this.put(
                            Routes.channelPermission(r.data.id, id),
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
      })
    );

    await listr.run();

    this.log(json({ CATEGORY_IDS, CHANNEL_IDS }));
  }
}
