import { Flags } from "@oclif/core";
import Config from "config";
import { User } from "data/db";
import { chunk } from "lodash";
import { Command } from "../../lib";

export default class CheckInGame extends Command {
  static description = "Check In Game";

  static flags = {
    "dry-run": Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(CheckInGame);

    const [admin, users] = await Promise.all([this.bot("ADMIN"), User.find()]);
    const members = await admin.guild.members.fetch();

    const notBot = members.filter((m) => !m.user.bot);

    const notDegen = notBot.filter((m) => {
      return (
        !m.roles.cache.has(Config.roleId("PREGEN")) &&
        !m.roles.cache.has(Config.roleId("DEGEN"))
      );
    });

    console.log(notDegen.size);

    const notDegenInGame = notDegen.filter((m) => {
      const user = users.find((u) => u.id === m.id);
      return user !== undefined && user.inGame === true;
    });

    console.log(notDegenInGame.size);

    if (flags["dry-run"]) {
      return;
    }

    const progress = this.getProgressBar(
      notDegenInGame.map((u) => u.displayName)
    );
    progress.start();

    const chunks = chunk(notDegenInGame.toJSON(), 10);

    for (let i = 0; i < chunks.length; i++) {
      await Promise.all(
        chunks[i].map(async (member) => {
          const user = users.find((u) => u.id === member.id)!;
          user.inGame = false;
          await user.save();
          progress.complete(user.displayName);
        })
      );
    }
  }
}
