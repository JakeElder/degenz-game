import Manifest from "manifest";
import { Role } from "data/db";
import { Flags } from "@oclif/core";
import Config from "config";
import { Command } from "../../lib";
import { getBot } from "../../utils";

export default class UpdateRoles extends Command {
  static description = "Diff and update roles";

  static flags = {
    "dry-run": Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const roles = await Manifest.roles();
    const { flags } = await this.parse(UpdateRoles);
    const dbRoles = await Role.find();

    const client = await getBot("ADMIN");
    const guild = await client.guilds.fetch(Config.general("GUILD_ID"));

    const absent = roles.filter(
      (r) => !dbRoles.find((dbr) => dbr.symbol === r.symbol)
    );

    if (flags["dry-run"]) {
      absent.forEach((r) => console.log(`INSERT ${r.symbol} - ${r.type}`));
    } else {
      await Role.insert(absent);
    }
  }
}
