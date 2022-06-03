import Config from "config";
import { Command } from "../../lib";
import pick from "random-item";

export default class IsBot extends Command {
  static description = "Check Is Bot";

  async run(): Promise<void> {
    const admin = await this.bot("ADMIN");
    const members = await admin.guild.members.fetch();

    const me = members.filter((m) => {
      return m.roles.cache.has(Config.roleId("MAGIC_EDEN_UPVOTER"));
    });

    const arr = me.toJSON();

    for (let i = 0; i < 5; i++) {
      console.log(pick(arr).displayName);
    }
  }
}
