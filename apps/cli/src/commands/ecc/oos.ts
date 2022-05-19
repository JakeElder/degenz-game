import { Flags } from "@oclif/core";
import { Command } from "../../lib";
import { Dormitory, DormitoryTenancy, User } from "data/db";

export default class CheckOOS extends Command {
  static description = "Check In Game";

  static flags = {
    "dry-run": Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(CheckOOS);

    const [bot, users] = await Promise.all([this.bot("ADMIN"), User.find()]);
    const members = await bot.guild.members.fetch();

    const oos = members.filter((member) => {
      if (member.user.bot) {
        return false;
      }
      let user = users.find((u) => u.id === member.id)!;
      return user.apartmentTenancies.length === 0 && !user.dormitoryTenancy;
    });

    console.log(oos.size);

    if (flags["dry-run"]) {
      return;
    }

    const progress = this.getProgressBar(oos.map((u) => u.displayName));
    progress.start();

    for (let i = 0; i < members.size; i++) {
      const member = members.at(i)!;
      let user = users.find((u) => u.id === member.id)!;

      if (user.apartmentTenancies.length === 0 && !user.dormitoryTenancy) {
        const dormitory = await Dormitory.choose();

        if (dormitory === null) {
          throw new Error();
        }

        user.dormitoryTenancy = DormitoryTenancy.create({ dormitory });
        user.inGame = true;

        await Promise.all([
          member.roles.add(dormitory.citizenRole.discordId),
          user.save(),
        ]);

        progress.complete(user.displayName);
      }
    }

    progress.stop();
  }
}
