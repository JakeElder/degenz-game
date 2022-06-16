import { promises as fs } from "fs";
import path from "path";
import { shuffle } from "lodash";
import shortUUID from "short-uuid";
import { PFP } from "data/db";
import { Command } from "../../lib";

export default class PrepPFPs extends Command {
  static description = "Prep PFPs";

  async run(): Promise<void> {
    const SRC_DIR = path.join(__dirname, "../../images/collection");
    const DEST_DIR = path.join(__dirname, "../../images/pfps");

    const files = await fs.readdir(SRC_DIR);

    const sample = shuffle(files).slice(0, 500);

    await Promise.all(
      sample.map(async (image) => {
        const id = shortUUID.generate();
        await fs.cp(
          path.join(SRC_DIR, image),
          path.join(DEST_DIR, `${id}.png`)
        );
        await PFP.insert({ id });
      })
    );
  }
}
