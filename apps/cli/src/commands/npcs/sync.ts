import Manifest from "manifest";
import { Command } from "../../lib";
import { NPC } from "data/db";

export default class SyncNPCs extends Command {
  static description = "Sync NPCs";

  async run(): Promise<void> {
    const { npcs } = await Manifest.load();
    await NPC.save(npcs);
    this.done();
  }
}
