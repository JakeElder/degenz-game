import Manifest from "manifest";
import { Command } from "../../lib";
import { Achievement } from "data/db";
import { AchievementSymbol } from "data/types";

export default class InsertAchievements extends Command {
  static description = "Insert achievements";

  async run(): Promise<void> {
    const { achievements } = await Manifest.load();

    const rows = await Achievement.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = achievements.filter(
      (achievement) => !existingIds.includes(achievement.id)
    );

    if (inserts.length === 0) {
      console.log("No achievements to insert.");
      return;
    }

    const confirm = await this.confirm(
      `Insert ${inserts.length} achievements?`
    );
    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar<AchievementSymbol>(
      inserts.map((achievement) => achievement.id)
    );
    progress.start();

    await Promise.all(
      inserts.map(async (achievement) => {
        await achievement.save();
        progress.complete(achievement.id);
      })
    );
  }
}
