import Manifest from "manifest";
import { Command } from "../../lib";
import { EngagementLevel } from "data/db";

export default class SyncEngagementLevels extends Command {
  static description = "Sync EngagementLevels";

  async run(): Promise<void> {
    const { engagementLevels } = await Manifest.load();
    await EngagementLevel.save(engagementLevels);
    this.done();
  }
}
