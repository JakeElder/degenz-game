import { Routes } from "discord-api-types/v9";
import Config from "config";
import { User } from "data/db";
import { CliUx, Flags } from "@oclif/core";
import Listr from "Listr";
import { Command } from "../../lib";
import { AxiosResponse } from "axios";

export default class AbsentUsers extends Command {
  static description = "Shows users that are no longer in the server.";

  static flags = {
    remove: Flags.boolean(),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AbsentUsers);

    let m: any[] = [];
    let res: AxiosResponse | null = null;
    let aftr: string;

    do {
      aftr = m.length ? `&after=${m[m.length - 1].user.id}` : "";
      res = await this.get(
        `${Routes.guildMembers(Config.general("GUILD_ID"))}?limit=1000${aftr}`,
        Config.botToken("ADMIN")
      );
      m.push(...res.data);
    } while (res.data.length === 1000);

    const users = await User.find();
    const absentUsers = users.filter(
      (u) => !m.some((m: any) => m.user.id === u.discordId)
    );

    if (flags.remove) {
      const cnfrm = await CliUx.ux.prompt(
        `Deleting ${absentUsers.length} users. Are you sure? Y/n`
      );

      if (cnfrm !== "Y") {
        return;
      }

      const listr = new Listr(
        absentUsers.map((u) => {
          return { title: u.displayName, task: () => u.remove() };
        })
      );

      await listr.run();
    } else {
      console.log(absentUsers.map((u) => u.displayName).join("\n"));
      console.log(absentUsers.length, "/", m.length);
    }
  }
}
