import Manifest from "manifest";
import { Command } from "../../lib";
import { PersistentMessage } from "data/db";
import { PersistentMessageSymbol } from "data/types";

export default class InsertPersistentMessages extends Command {
  static description = "Insert persistent messages";

  async run(): Promise<void> {
    const { persistentMessages } = await Manifest.load();

    const rows = await PersistentMessage.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = persistentMessages.filter(
      (message) => !existingIds.includes(message.id)
    );

    if (inserts.length === 0) {
      console.log("No messages to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} messages?`);
    if (!confirm) {
      return;
    }

    const progress = this.getProgressBar<PersistentMessageSymbol>(
      inserts.map((dormitory) => dormitory.id)
    );
    progress.start();

    await Promise.all(
      inserts.map(async (message) => {
        await message.save();
        progress.complete(message.id);
      })
    );
  }
}
