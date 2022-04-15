import Manifest from "manifest";
import { Command } from "../../lib";
import { Dormitory } from "data/db";
import { DormitorySymbol } from "data/types";

export default class InsertDormitories extends Command {
  static description = "Insert dormitories";

  async run(): Promise<void> {
    const { dormitories } = await Manifest.load();

    const rows = await Dormitory.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = dormitories.filter(
      (dormitory) => !existingIds.includes(dormitory.id)
    );

    if (inserts.length === 0) {
      console.log("No dormitories to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} dormitories?`);
    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar<DormitorySymbol>(
      inserts.map((dormitory) => dormitory.id)
    );
    progress.start();

    await Promise.all(
      inserts.map(async (dormitory) => {
        await dormitory.save();
        progress.complete(dormitory.id);
      })
    );
  }
}
