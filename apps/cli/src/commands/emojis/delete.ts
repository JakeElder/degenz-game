import Manifest from "manifest";
import Config from "config";
import { Command } from "../../lib";
import { Emoji } from "data/db";
import prompts from "prompts";
import ProgressBar from "../../lib/ProgressBar";
import { getBot } from "../../utils";
import { Flags } from "@oclif/core";
import { EmojiSymbol } from "data/types";

export default class DeleteEmojis extends Command {
  static description = "Deploy emojis";

  static flags = {
    select: Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(DeleteEmojis);

    const emojis = await Manifest.emojis();

    const client = await getBot("ADMIN", (rl) => progress.rateLimit(rl));
    const guild = await client.guilds.fetch(Config.general("GUILD_ID"));

    const rows = await Emoji.find();
    let deletes = emojis.filter(
      (e) => typeof rows.find((r) => r.symbol === e.symbol) !== "undefined"
    );

    const missing = deletes.filter(
      (d) =>
        typeof guild.emojis.cache.find((e) => e.name === d.name) === "undefined"
    );

    if (missing.length) {
      console.error(
        "Missing emojis on server",
        missing.map((e) => e.symbol)
      );
      throw new Error();
    }

    if (flags.select) {
      const response = await prompts([
        {
          type: "multiselect",
          name: "emojis",
          message: "Which emojis should be deleted?",
          choices: deletes.map((d) => ({ title: d.symbol, value: d.symbol })),
        },
      ]);

      deletes = deletes.filter((d) => response.emojis.includes(d.symbol));
    }

    const response = await prompts([
      {
        type: "toggle",
        name: "cancel",
        message: `Delete ${deletes.length} emojis?`,
        initial: false,
        active: "No",
        inactive: "Yes",
      },
    ]);

    if (response.cancel) {
      client.destroy();
      return;
    }

    const progress = new ProgressBar<EmojiSymbol>(deletes.map((e) => e.symbol));
    progress.start();

    try {
      await Promise.all(
        deletes.map(async (e) => {
          const ge = guild.emojis.cache.find((ge) => ge.name === e.name)!;
          await ge.delete();
          await Emoji.delete({ symbol: e.symbol });
          progress.complete(e.symbol);
        })
      );
    } catch (e) {
      progress.stop();
      console.error(e);
      throw new Error();
    }

    progress.stop();
    client.destroy();
  }
}
