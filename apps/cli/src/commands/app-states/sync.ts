import Manifest from "manifest";
import { Command } from "../../lib";
import { AppState } from "data/db";

export default class SyncAppStates extends Command {
  static description = "Sync app states";

  async run(): Promise<void> {
    const { appStates } = await Manifest.load();
    await AppState.save(appStates);
    this.done();
  }
}
