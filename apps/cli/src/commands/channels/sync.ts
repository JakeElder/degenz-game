import Manifest from "manifest";
import { ManagedChannel } from "data/db";
import Config from "config";
import { Command } from "../../lib";

export default class SyncChannels extends Command {
  static description = "Sync channels";

  async run(): Promise<void> {
    const { channels } = await Manifest.load();

    const [syncCategories, syncChannels, bot] = await Promise.all([
      ManagedChannel.find({ where: { type: "CATEGORY" } }),
      ManagedChannel.find({ where: { type: "CHANNEL" } }),
      this.bot("ADMIN"),
    ]);

    const progress = this.getProgressBar(
      [...syncCategories, ...syncChannels].map((c) => c.id)
    );
    progress.start();

    await Promise.all(
      syncCategories.map(async (c) => {
        const source = channels.find((s) => s.id === c.id);

        if (!source) {
          throw new Error(`Channel ${c.id} not found`);
        }

        const dc = await bot.guild.channels.fetch(c.discordChannel.id);

        if (!dc) {
          throw new Error(
            `Discord channel not found: ${c.name}:${c.discordChannel.id}`
          );
        }

        let p = source.permissionOverwrites;

        await dc.edit({
          name: source.name,
          permissionOverwrites: p.map((po) => {
            return { ...po, id: Config.roleId(po.id) };
          }),
        });

        progress.complete(source.id);
      })
    );

    await Promise.all(
      syncChannels
        .filter((c) => c.type === "CHANNEL")
        .map(async (c) => {
          const source = channels.find((s) => s.id === c.id);

          if (!source) {
            throw new Error(`Channel ${c.id} not found`);
          }

          const dc = await bot.guild.channels.fetch(c.discordChannel.id);

          if (!dc) {
            throw new Error(
              `Discord channel not found: ${c.name}:${c.discordChannel.id}`
            );
          }

          await dc.edit({ name: source.name });

          if (source.lockPermissions) {
            await dc.lockPermissions();
          }

          await Promise.all(
            source.permissionOverwrites.map((po) =>
              dc.permissionOverwrites.create(Config.roleId(po.id), {
                ...(po.allow || []).reduce((c, v) => ({ ...c, [v]: true }), {}),
                ...(po.deny || []).reduce((c, v) => ({ ...c, [v]: false }), {}),
              })
            )
          );

          progress.complete(source.id);
        })
    );
  }
}
