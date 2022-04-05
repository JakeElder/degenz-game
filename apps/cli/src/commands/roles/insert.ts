import Manifest from "manifest";
import { Role } from "data/db";
import { Flags } from "@oclif/core";
import { Command } from "../../lib";

export default class InsertRoles extends Command {
  static description = "Insert roles from manifest";

  static flags = {
    "dry-run": Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const roles = await Manifest.roles();
    const { flags } = await this.parse(InsertRoles);
    const dbRoles = await Role.find();

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
