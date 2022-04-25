import Manifest from "manifest";
import { Command } from "../../lib";
import { Achievement } from "data/db";

export default class SyncAchievements extends Command {
  static description = "Sync Achievements";

  async run(): Promise<void> {
    const { achievements } = await Manifest.load();
    await Achievement.save(achievements);
    this.done();
  }
}
