import Manifest from "manifest";
import { ManagedChannel } from "data/db";
import { Command } from "../../lib";
import { resolveOverwrites } from "../../utils";

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

        const permissionOverwrites = resolveOverwrites(
          source.permissionOverwrites
        );

        await dc.edit({
          name: source.name,
          permissionOverwrites,
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

          const parent = channels.find((c) => c.id === source.parent.id);

          if (!parent) {
            throw new Error(`Channel ${source.parent.id} not found`);
          }

          const dc = await bot.guild.channels.fetch(c.discordChannel.id);

          if (!dc) {
            throw new Error(
              `Discord channel not found: ${c.name}:${c.discordChannel.id}`
            );
          }

          const permissionOverwrites = resolveOverwrites(
            source.lockPermissions
              ? [...parent.permissionOverwrites, ...source.permissionOverwrites]
              : source.permissionOverwrites
          );

          await dc.edit({
            name: source.name,
            permissionOverwrites,
          });

          progress.complete(source.id);
        })
    );
  }
}
