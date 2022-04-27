import Manifest from "manifest";
import { Command } from "../../lib";
import { District } from "data/db";

export default class SyncDistricts extends Command {
  static description = "Sync Districts";

  async run(): Promise<void> {
    const { districts } = await Manifest.load();
    await District.save(districts);
    this.done();
  }
}
