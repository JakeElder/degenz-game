import Manifest from "manifest";
import { Command } from "../../lib";
import { DiscordChannel, ManagedChannel } from "data/db";
import { ManagedChannelSymbol } from "data/types";
import prompts from "prompts";
import chalk from "chalk";

export default class InsertChannels extends Command {
  static description = "Insert channels";

  async run(): Promise<void> {
    const { channels } = await Manifest.load();

    const rows = await ManagedChannel.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = channels
      .filter((c) => !existingIds.includes(c.id))
      .sort((a, b) => {
        const aType = a.parent === undefined ? "CATEGORY" : "CHANNEL";
        const bType = b.parent === undefined ? "CATEGORY" : "CHANNEL";
        if (aType === bType) {
          return 0;
        }
        return aType === "CATEGORY" ? -1 : 1;
      });

    const total = inserts.length;
    inserts = inserts.slice(0, 3);

    if (inserts.length === 0) {
      console.log("No channels to insert.");
      return;
    }

    const confirm = await this.confirm(
      `Insert ${inserts.length}/${total} channels?`
    );
    if (!confirm) {
      this.cancelled();
      return;
    }

    const discordIds = await prompts(
      inserts.map((c) => {
        return {
          type: "text",
          name: c.id,
          message: `${chalk.yellow(c.name)} id?`,
        };
      })
    );

    if (inserts.some((c) => discordIds[c.id] === undefined)) {
      return;
    }

    const bot = await this.bot("ADMIN");
    const progress = this.getProgressBar<ManagedChannelSymbol>(
      inserts.map((c) => c.id)
    );
    bot.onRateLimit = (ms) => progress.rateLimit(ms);
    progress.start();

    await Promise.all(
      inserts
        .filter((mc) => mc.parent === undefined)
        .map(async (mc) => {
          mc.type = "CATEGORY";
          mc.discordChannel = DiscordChannel.create({
            id: discordIds[mc.id],
            type: "MANAGED",
          });
          await mc.save();
          progress.complete(mc.id);
        })
    );

    await Promise.all(
      inserts
        .filter((mc) => mc.parent !== undefined)
        .map(async (mc) => {
          mc.type = "CHANNEL";
          mc.discordChannel = DiscordChannel.create({
            id: discordIds[mc.id],
            type: "MANAGED",
          });
          await mc.save();
          progress.complete(mc.id);
        })
    );
  }
}
