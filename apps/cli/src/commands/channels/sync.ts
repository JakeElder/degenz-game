import Manifest from "manifest";
import { Command } from "../../lib";
import { ManagedChannel } from "data/db";
import Config from "config";

export default class SyncChannels extends Command {
  static description = "Sync channels";

  async run(): Promise<void> {
    const { channels } = await Manifest.load();
    const flat = channels.flatMap((c) => [c, ...(c.children || [])]);

    const syncs = await ManagedChannel.find();
    const bot = await this.bot("ADMIN");

    const progress = this.getProgressBar(flat.map((c) => c.id));
    progress.start();

    await Promise.all(
      syncs.map(async (c) => {
        const source = flat.find((s) => s.id === c.id);

        if (!source) {
          throw new Error(`Channel ${c.id} not found`);
        }

        const dc = await bot.guild.channels.fetch(c.channel.id);

        if (!dc) {
          throw new Error(
            `Discord channel not found: ${c.name}:${c.channel.id}`
          );
        }

        const pos = source.permissionOverwrites.map((po) => {
          return { ...po, id: Config.roleId(po.id) };
        });

        await dc.edit({
          name: source.name,
          permissionOverwrites: pos,
        });

        progress.complete(source.id);
      })
    );
  }
}
