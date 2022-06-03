import { Flags } from "@oclif/core";
import { Command } from "../../lib";

export default class IsBot extends Command {
  static description = "Check Is Bot";

  static flags = {
    "dry-run": Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(IsBot);

    const admin = await this.bot("ADMIN");
    const members = await admin.guild.members.fetch();

    const botmai = members.filter((m) => {
      return /\d{7}/.test(m.displayName);
    });

    console.log(botmai.size);

    for (let i = 0; i < botmai.size; i++) {
      const bot = botmai.at(i)!;
      if (flags["dry-run"]) {
        await bot.ban();
        console.log(`banned ${bot.displayName}`);
      } else {
        console.log(bot.displayName);
      }
    }
  }
}
