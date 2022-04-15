import Manifest from "manifest";
import { Command } from "../../lib";
import { Role } from "data/db";
import { RoleSymbol } from "data/types";
import prompts from "prompts";
import chalk from "chalk";

export default class InsertRoles extends Command {
  static description = "Insert roles";

  async run(): Promise<void> {
    const { roles } = await Manifest.load();

    const rows = await Role.find();
    const existingIds = rows.map((r) => r.id);

    let inserts = roles.filter((r) => !existingIds.includes(r.id));

    const bot = await this.bot("ADMIN");

    if (inserts.length === 0) {
      console.log("No roles to insert.");
      return;
    }

    const confirm = await this.confirm(`Insert ${inserts.length} roles?`);
    if (!confirm) {
      return;
    }

    const discordIds = await prompts(
      inserts.map((role) => {
        return {
          type: "text",
          name: role.id,
          message: `"${chalk.yellow(role.id)}" id?`,
        };
      })
    );

    const progress = this.getProgressBar<RoleSymbol>(inserts.map((r) => r.id));
    bot.onRateLimit = (ms) => progress.rateLimit(ms);
    progress.start();

    await Promise.all(
      inserts.map(async (role) => {
        role.discordId = discordIds[role.id];
        await role.save();
        progress.complete(role.id);
      })
    );
  }
}
