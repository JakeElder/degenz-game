import Manifest from "manifest";
import { Command } from "../../lib";
import { District } from "data/db";
import { DistrictSymbol } from "data/types";

export default class InsertDistricts extends Command {
  static description = "Insert districts";

  async run(): Promise<void> {
    const { districts } = await Manifest.load();

    const rows = await District.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = districts.filter(
      (district) => !existingIds.includes(district.id)
    );

    if (inserts.length === 0) {
      console.log("No districts to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} districts?`);
    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar<DistrictSymbol>(
      inserts.map((district) => district.id)
    );
    progress.start();

    await Promise.all(
      inserts.map(async (district) => {
        await district.save();
        progress.complete(district.id);
      })
    );
  }
}
