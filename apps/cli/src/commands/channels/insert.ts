import Manifest from "manifest";
import { Command } from "../../lib";
import { Channel, ManagedChannel } from "data/db";
import { ManagedChannelSymbol } from "data/types";
import prompts from "prompts";
import chalk from "chalk";

export default class InsertChannels extends Command {
  static description = "Insert channels";

  async run(): Promise<void> {
    const { channels } = await Manifest.load();

    const rows = await ManagedChannel.find();
    const existingIds = rows.map((r) => r.id);

    const removeExisting = (channels: ManagedChannel[]) =>
      channels.filter((c) => !existingIds.includes(c.id));

    let inserts = removeExisting(channels).map((c) => {
      c.children = removeExisting(c.children || []);
      return c;
    });

    const bot = await this.bot("ADMIN");

    const flat = inserts.flatMap((c) => [c, ...c.children]);

    if (inserts.length === 0) {
      console.log("No channels to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} channels?`);
    if (!confirm) {
      return;
    }

    const discordIds = await prompts(
      flat.map((c) => {
        return {
          type: "text",
          name: c.id,
          message: `"${chalk.yellow(c.name)}" id?`,
        };
      })
    );

    const progress = this.getProgressBar<ManagedChannelSymbol>(
      flat.map((c) => c.id)
    );
    bot.onRateLimit = (ms) => progress.rateLimit(ms);
    progress.start();

    await Promise.all(
      inserts.map(async (mc) => {
        mc.type = "CATEGORY";
        mc.channel = Channel.create({ id: discordIds[mc.id], type: "MANAGED" });
        mc.children = mc.children.map((mcc) => {
          mcc.type = "CHANNEL";
          mcc.channel = Channel.create({
            id: discordIds[mcc.id],
            type: "MANAGED",
          });
          return mcc;
        });
        await mc.save();
        const ids = [mc, ...mc.children].map((c) => c.id);
        for (let i = 0; i < ids.length; i++) {
          progress.complete(ids[i]);
        }
      })
    );
  }
}
