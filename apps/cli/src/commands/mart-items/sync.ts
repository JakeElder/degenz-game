import Manifest from "manifest";
import { Command } from "../../lib";
import { MartItem } from "data/db";

export default class SyncMartItems extends Command {
  static description = "Sync mart items";

  async run(): Promise<void> {
    const { martItems } = await Manifest.load();
    await MartItem.save(martItems);
    this.done();
  }
}
