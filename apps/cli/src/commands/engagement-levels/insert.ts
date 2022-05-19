import Manifest from "manifest";
import { Command } from "../../lib";
import { EngagementLevel } from "data/db";

export default class InsertEngagementLevels extends Command {
  static description = "Insert engagement levels";

  async run(): Promise<void> {
    const { engagementLevels } = await Manifest.load();

    const rows = await EngagementLevel.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = engagementLevels.filter((el) => !existingIds.includes(el.id));

    if (inserts.length === 0) {
      console.log("No engagement levels to insert.");
      return;
    }

    const confirm = await this.confirm(
      `Insert ${inserts.length} engagement levels?`
    );

    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar(inserts.map((el) => el.id.toString()));
    progress.start();

    await Promise.all(
      inserts.map(async (el) => {
        await el.save();
        progress.complete(el.id.toString());
      })
    );
  }
}
