import Manifest from "manifest";
import { Emoji } from "data/db";
import prompts from "prompts";
import { EmojiSymbol } from "data/types";
import { Flags } from "@oclif/core";
import { Command } from "../../lib";

export default class DeleteEmojis extends Command {
  static description = "Delete emojis";

  static flags = {
    select: Flags.boolean({ default: false }),
    "server-only": Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(DeleteEmojis);
    const { emojis } = await Manifest.load();

    if (flags["server-only"]) {
      await this.deleteFromServer(flags.select);
      return;
    }

    const bot = await this.bot("ADMIN");

    const rows = await Emoji.find();
    let deletes = emojis.filter(
      (e) => typeof rows.find((r) => r.id === e.id) !== "undefined"
    );

    const missing = deletes.filter(
      (d) =>
        typeof bot.guild.emojis.cache.find((e) => e.name === d.name) ===
        "undefined"
    );

    if (missing.length) {
      console.error(
        "Missing emojis on server",
        missing.map((e) => e.id)
      );
      throw new Error();
    }

    if (flags.select) {
      const response = await prompts([
        {
          type: "multiselect",
          name: "emojis",
          message: "Which emojis should be deleted?",
          choices: deletes.map((d) => ({ title: d.id, value: d.id })),
        },
      ]);
      deletes = deletes.filter((d) => response.emojis.includes(d.id));
    }

    if (deletes.length === 0) {
      console.log("No emojis to delete.");
      bot.destroy();
      return;
    }

    const confirm = await this.confirm(`Delete ${deletes.length} emojis?`);

    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar<EmojiSymbol>(deletes.map((e) => e.id));
    progress.start();

    await Promise.all(
      deletes.map(async (e) => {
        const ge = bot.guild.emojis.cache.find((ge) => ge.name === e.name)!;
        await ge.delete();
        await e.remove();
        progress.complete(e.id);
      })
    );
  }

  async deleteFromServer(select: boolean) {
    const bot = await this.bot("ADMIN");
    let deletes = bot.guild.emojis.cache;

    if (select) {
      const response = await prompts([
        {
          type: "multiselect",
          name: "emojis",
          message: "Which emojis should be deleted?",
          choices: deletes.map((d) => ({ title: d.name || d.id, value: d.id })),
        },
      ]);
      deletes = deletes.filter((d) => response.emojis.includes(d.id));
    }

    if (deletes.size === 0) {
      console.log("No emojis to delete.");
      return;
    }

    const confirm = await this.confirm(`Delete ${deletes.size} emojis?`);
    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar(deletes.map((e) => e.name || e.id));
    bot.onRateLimit = (ms) => progress.rateLimit(ms);
    progress.start();

    await Promise.all(
      deletes.map(async (e) => {
        await e.delete();
        progress.complete(e.name || e.id);
      })
    );
  }
}
