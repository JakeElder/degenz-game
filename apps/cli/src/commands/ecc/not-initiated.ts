import { Flags } from "@oclif/core";
import Config from "config";
import { Dormitory, DormitoryTenancy, User } from "data/db";
import { Command } from "../../lib";
import { json } from "../../utils";

export default class NotInitiated extends Command {
  static description = "Check Not Initiated";

  static flags = {
    "dry-run": Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(NotInitiated);

    const [bot, users] = await Promise.all([this.bot("ADMIN"), User.find()]);
    const members = await bot.guild.members.fetch();

    const missing = members.filter((m) => {
      if (m.user.bot) {
        return false;
      }

      if (m.roles.cache.has(Config.roleId("PREGEN"))) {
        const user = users.find((u) => u.id === m.id);
        return user !== undefined && user.primaryTenancy === null;
      }

      return false;
    });

    console.log(missing.size);
    console.log(json(missing.map((m) => m.displayName)));

    if (flags["dry-run"] || missing.size === 0) {
      return;
    }

    const progress = this.getProgressBar(missing.map((m) => m.displayName));
    progress.start();

    await Promise.all(
      missing.map(async (member) => {
        await member.roles.add("976674426047307916");

        const dormitory = await Dormitory.choose();

        if (dormitory === null) {
          throw new Error();
        }

        const user = users.find((u) => u.id === member.id)!;

        user.gbt ??= 0;
        user.gbt += 1000;
        user.strength = 100;
        user.inGame = true;
        user.dormitoryTenancy = DormitoryTenancy.create({ dormitory });

        await Promise.all([
          member.roles.add(dormitory.citizenRole.discordId),
          user.save(),
        ]);

        progress.complete(user.displayName);
      })
    );
  }
}
