import Manifest from "manifest";
import { Command } from "../../lib";
import { NPC } from "data/db";
import { NPCSymbol, RoleSymbol } from "data/types";
import prompts from "prompts";
import chalk from "chalk";

export default class InsertNPCs extends Command {
  static description = "Insert NPCs";

  async run(): Promise<void> {
    const { npcs } = await Manifest.load();

    const rows = await NPC.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = npcs.filter((r) => !existingIds.includes(r.id));

    const bot = await this.bot("ADMIN");

    if (inserts.length === 0) {
      console.log("No NPCs to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} NPCs?`);
    if (!confirm) {
      return;
    }

    const discordIds = await prompts(
      inserts.map((npc) => {
        return {
          type: "text",
          name: npc.id,
          message: `"${chalk.yellow(npc.id)}" client id?`,
        };
      })
    );

    const progress = this.getProgressBar<NPCSymbol>(inserts.map((r) => r.id));
    bot.onRateLimit = (ms) => progress.rateLimit(ms);
    progress.start();

    await Promise.all(
      inserts.map(async (npc) => {
        npc.clientId = discordIds[npc.id];
        await npc.save();
        progress.complete(npc.id);
      })
    );
  }
}
