import Config from "config";
import { Command } from "../../lib";
import pick from "random-item";
import { User } from "data/db";
import { Not, IsNull } from "typeorm";
import { inspect } from "util";
import { json } from "../../utils";

export default class IsBot extends Command {
  static description = "Check Is Bot";

  async run(): Promise<void> {
    const admin = await this.bot("ADMIN");
    const members = await admin.guild.members.fetch();

    const users = await User.findBy({ walletAddress: Not(IsNull()) });
    console.log(users.length);

    const output = users
      .map((u) => {
        const member = members.get(u.id);

        if (!member) {
          console.log(`${u.displayName} not found.`);
          return null;
        }

        let hasWL = false;
        let hasOG = false;
        let mints = 0;

        if (
          member.roles.cache.has(Config.roleId("WHITELIST_CONFIRMED")) ||
          member.roles.cache.has(Config.roleId("WHITELIST"))
        ) {
          hasWL = true;
          mints++;
        }

        if (
          member.roles.cache.has(Config.roleId("OG_WHITELIST_CONFIRMED")) ||
          member.roles.cache.has(Config.roleId("OG_WHITELIST_CONFIRMED"))
        ) {
          hasOG = true;
          mints += 2;
        }

        return {
          Id: member.id,
          "Display Name": member.displayName,
          Wallet: u.walletAddress,
          WL: hasWL ? "✅" : "❌",
          OG: hasOG ? "✅" : "❌",
          Mints: mints,
        };
      })
      .filter((u) => u);

    console.log(json(output));
  }
}
