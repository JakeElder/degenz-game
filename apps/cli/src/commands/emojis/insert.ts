import Manifest from "manifest";
import Config from "config";
import { Command } from "../../lib";
import { fileExists, getBot } from "../../utils";
import path from "path";
import { promises as fs } from "fs";
import { Emoji } from "data/db";
import ProgressBar from "../../lib/ProgressBar";
import { Flags } from "@oclif/core";
import prompts from "prompts";

export default class InsertEmojis extends Command {
  static description = "Deploy emojis";

  static flags = {
    select: Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(InsertEmojis);

    const emojis = await Manifest.emojis();

    const client = await getBot("ADMIN", (rl) => progress.rateLimit(rl));
    const guild = await client.guilds.fetch(Config.general("GUILD_ID"));

    const rows = await Emoji.find();

    let inserts = emojis.filter(
      (e) => typeof rows.find((r) => r.symbol === e.symbol) === "undefined"
    );

    const files = await Promise.all(
      inserts.map(async (s) => {
        const file = path.join(
          __dirname,
          `../../images/emojis/${s.symbol}.png`
        );
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
        missing.map((idx) => inserts[idx].symbol)
      );
      throw new Error();
    }

    if (flags.select) {
      const response = await prompts([
        {
          type: "multiselect",
          name: "emojis",
          message: "Which emojis should be deleted?",
          choices: inserts.map((i) => ({ title: i.symbol, value: i.symbol })),
        },
      ]);

      inserts = inserts.filter((d) => response.emojis.includes(d.symbol));
    }

    const response = await prompts([
      {
        type: "toggle",
        name: "cancel",
        message: `Insert ${inserts.length} emojis?`,
        initial: false,
        active: "No",
        inactive: "Yes",
      },
    ]);

    if (response.cancel) {
      client.destroy();
      return;
    }

    const progress = new ProgressBar(inserts.map((e) => e.symbol));
    progress.start();

    try {
      await Promise.all(
        inserts.map(async (e, idx) => {
          const file = await fs.readFile((files as string[])[idx]);
          const emoji = await guild.emojis.create(file, e.name);
          await Emoji.insert({
            symbol: e.symbol,
            identifier: emoji.identifier,
          });
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
