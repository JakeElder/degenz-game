import Manifest from "manifest";
import { Command } from "../../lib";
import { Emoji } from "data/db";
import { Flags } from "@oclif/core";
import { EmojiSymbol } from "data/types";
import path from "path";
import { promises as fs } from "fs";
import { fileExists } from "../../utils";

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

    const files = await Promise.all(
      missing.map(async (s) => {
        const file = path.join(__dirname, `../../images/emojis/${s.id}.png`);
        const exists = await fileExists(file);
        return exists ? file : null;
      })
    );

    const missingFiles = files.reduce<number[]>((v, c, idx) => {
      return c === null ? [...v, idx] : v;
    }, []);

    if (missingFiles.length) {
      console.error(
        "Missing emoji files",
        missingFiles.map((idx) => missing[idx].id)
      );
      throw new Error();
    }

    const progress = this.getProgressBar<EmojiSymbol>(missing.map((e) => e.id));
    bot.onRateLimit = (ms) => progress.rateLimit(ms);
    progress.start();

    await Promise.all(
      missing.map(async (e, idx) => {
        const file = await fs.readFile(files[idx]!);
        const emoji = await bot.guild.emojis.create(file, e.name);
        e.identifier = emoji.identifier;
        await e.save();
        progress.complete(e.id);
      })
    );
  }
}
