import Manifest from "manifest";
import { Command } from "../../lib";
import { MartItem } from "data/db";
import { MartItemSymbol } from "data/types";

export default class InsertMartItems extends Command {
  static description = "Insert mart items";

  async run(): Promise<void> {
    const { martItems } = await Manifest.load();

    const rows = await MartItem.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = martItems.filter((item) => !existingIds.includes(item.id));

    if (inserts.length === 0) {
      console.log("No mart items to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} mart items?`);
    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar<MartItemSymbol>(
      inserts.map((item) => item.id)
    );
    progress.start();

    await Promise.all(
      inserts.map(async (item) => {
        await item.save();
        progress.complete(item.id);
      })
    );
  }
}
