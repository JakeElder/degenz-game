import Manifest from "manifest";
import { Command } from "../../lib";
import { Emoji } from "data/db";
import { Flags } from "@oclif/core";

export default class SyncEmojis extends Command {
  static description = "Sync emojis";

  static flags = {
    discord: Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(SyncEmojis);

    if (flags.discord) {
      await this.syncDiscord();
      return;
    }

    const { emojis } = await Manifest.load();
    await Emoji.save(emojis);
    this.done();
  }

  async syncDiscord() {
    const rows = await Emoji.find();
    const bot = await this.bot("ADMIN");

    const emojis = bot.guild.emojis.cache;

    const missing = rows.filter(
      (r) => emojis.find((e) => e.name === r.name) === undefined
    );
    console.log(missing.map((r) => r.id));
  }
}
