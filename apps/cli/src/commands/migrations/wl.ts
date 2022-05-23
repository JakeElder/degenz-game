import { Command } from "../../lib";
import { User } from "data/db";
import Config from "config";
import { Not, IsNull } from "typeorm";
import { chunk } from "lodash";

export default class UpdateWL extends Command {
  static description = "Sync Achievements";

  async run(): Promise<void> {
    const [bot, users] = await Promise.all([
      this.bot("ADMIN"),
      User.find({ where: { walletAddress: Not(IsNull()) } }),
    ]);

    const members = await bot.guild.members.fetch();

    const progress = this.getProgressBar(users.map((u) => u.displayName));
    progress.start();

    // for (let i = 0; i < members.size; i++) {
    //   const m = members.at(i)!;
    //   const user = users.find((u) => u.id === m.id);

    //   if (!user) {
    //     continue;
    //   }

    //   const hwl = m.roles.cache.has(Config.roleId("WHITELIST_CONFIRMED"));
    //   const hogwl = m.roles.cache.has(Config.roleId("OG_WHITELIST_CONFIRMED"));

    //   if (hwl || hogwl) {
    //     if (!user.walletAddress) {
    //       console.log(user.displayName);
    //     }
    //   }
    // }

    const chunks = chunk(users, 10);

    for (let i = 0; i < chunks.length; i++) {
      await Promise.all(
        chunks[i].map(async (u) => {
          const m = members.get(u.id);

          if (m === undefined) {
            return;
          }

          const wl = m.roles.cache.has(Config.roleId("WHITELIST"));
          const ogwl = m.roles.cache.has(Config.roleId("OG_WHITELIST"));

          if (wl || ogwl) {
            await m.roles.remove([
              Config.roleId("WHITELIST"),
              Config.roleId("OG_WHITELIST"),
            ]);

            await m.roles.add([
              ...(wl ? [Config.roleId("WHITELIST_CONFIRMED")] : []),
              ...(ogwl ? [Config.roleId("OG_WHITELIST_CONFIRMED")] : []),
            ]);
          }

          progress.complete(u.displayName);
        })
      );
    }
  }
}
