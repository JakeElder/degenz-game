import { Routes } from "discord-api-types/v9";
import { Command } from "../../lib";
import Config from "config";
import { Flags } from "@oclif/core";
import { User } from "data/db";

export default class Members extends Command {
  static description = "Members";

  static flags = {
    sync: Flags.boolean(),
    dry: Flags.boolean(),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Members);

    const res = await this.get(
      `${Routes.guildMembers(Config.general("GUILD_ID"))}?limit=1000`,
      Config.botToken("ADMIN")
    );

    if (flags.sync) {
      const users = await User.find();

      if (flags.dry) {
        users.forEach((u) => {
          const m = res.data.find((m: any) => m.user.id === u.discordId);

          if (!m) {
            throw new Error(`Missing Member, ${u.displayName}`);
          }

          if (u.displayName !== (m.nick || m.user.username)) {
            console.log(`${u.displayName} => ${m.nick || m.user.username}`);
          }
        });
      } else {
        await User.save(
          users.map((u) => {
            const m = res.data.find((m: any) => m.user.id === u.discordId);
            if (!m) {
              throw new Error(`Missing Member, ${u.displayName}`);
            }
            u.displayName = m.nick || m.user.username;
            return u;
          })
        );
      }
    } else {
      console.log(JSON.stringify(res.data, null, 2));
    }
  }
}
