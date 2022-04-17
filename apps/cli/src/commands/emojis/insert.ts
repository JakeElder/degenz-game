import Manifest from "manifest";
import { Command } from "../../lib";
import { fileExists } from "../../utils";
import path from "path";
import { promises as fs } from "fs";
import { Emoji } from "data/db";
import { Flags } from "@oclif/core";
import prompts from "prompts";
import { EmojiSymbol } from "data/types";

export default class InsertEmojis extends Command {
  static description = "Deploy emojis";

  static flags = {
    select: Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(InsertEmojis);
    const { emojis } = await Manifest.load();

    const rows = await Emoji.find();

    let inserts = emojis.filter(
      (e) => typeof rows.find((r) => r.id === e.id) === "undefined"
    );

    const files = await Promise.all(
      inserts.map(async (s) => {
        const file = path.join(__dirname, `../../images/emojis/${s.id}.png`);
        const exists = await fileExists(file);
        return exists ? file : null;
      })
    );

    const missing = files.reduce<number[]>((v, c, idx) => {
      return c === null ? [...v, idx] : v;
    }, []);

    if (missing.length) {
      console.error(
        "Missing emoji files",
        missing.map((idx) => inserts[idx].id)
      );
      throw new Error();
    }

    if (flags.select) {
      const response = await prompts([
        {
          type: "multiselect",
          name: "emojis",
          message: "Which emojis should be inserted?",
          choices: inserts.map((i) => ({ title: i.name, value: i.id })),
        },
      ]);

      inserts = inserts.filter((d) => response.emojis.includes(d.id));
    }

    if (inserts.length === 0) {
      console.log("No emojis to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} emojis?`);

    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar<EmojiSymbol>(inserts.map((e) => e.id));
    const bot = await this.bot("ADMIN");
    bot.onRateLimit = (ms) => progress.rateLimit(ms);
    progress.start();

    await Promise.all(
      inserts.map(async (e, idx) => {
        const file = await fs.readFile(files[idx] as string);
        const emoji = await bot.guild.emojis.create(file, e.name);
        e.identifier = emoji.identifier;
        await e.save();
        progress.complete(e.id);
      })
    );
  }
}
