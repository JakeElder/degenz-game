import Config from "config";
import { User } from "data/db";
import { Command } from "../../lib";

export default class SetMintPasses extends Command {
  static description = "Set Mint Passes";

  async run(): Promise<void> {
    const admin = await this.bot("ADMIN");
    const members = await admin.guild.members.fetch();

    const mintPassMembers = members.filter((m) => {
      return (
        m.roles.cache.has(Config.roleId("MINT_PASS")) ||
        m.roles.cache.has(Config.roleId("SECOND_MINT_PASS"))
      );
    });

    for (let i = 0; i < mintPassMembers.size; i++) {
      const m = mintPassMembers.at(i)!;
      const passes = m.roles.cache.has(Config.roleId("SECOND_MINT_PASS"))
        ? 2
        : 1;
      await User.update({ id: m.id }, { mintPasses: passes });
      console.log(`${m.displayName} : ${m.id} : ${passes}`);
    }
  }
}
