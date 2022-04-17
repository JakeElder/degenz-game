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

    let inserts = channels.filter((c) => !existingIds.includes(c.id));

    if (inserts.length === 0) {
      console.log("No channels to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} channels?`);
    if (!confirm) {
      return;
    }

    const discordIds = await prompts(
      inserts.map((c) => {
        return {
          type: "text",
          name: c.id,
          message: `"${chalk.yellow(c.name)}" id?`,
        };
      })
    );

    const bot = await this.bot("ADMIN");
    const progress = this.getProgressBar<ManagedChannelSymbol>(
      inserts.map((c) => c.id)
    );
    bot.onRateLimit = (ms) => progress.rateLimit(ms);
    progress.start();

    await Promise.all(
      inserts.map(async (mc) => {
        mc.type = mc.parent ? "CHANNEL" : "CATEGORY";
        mc.channel = Channel.create({ id: discordIds[mc.id], type: "MANAGED" });
        await mc.save();
        progress.complete(mc.id);
      })
    );
  }
}
