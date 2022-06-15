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

    const names = [
      "𝘋𝘌𝘎𝘌𝘕𝘡 𝘎𝘈𝘔𝘌",
      "𝗗𝗘𝗚𝗘𝗡𝗭 𝗚𝗔𝗠𝗘",
      "𝙳𝙴𝙶𝙴𝙽𝚉 𝙶𝙰𝙼𝙴",
      "DEGENZ GAME Bot",
      "𝐃𝐄𝐆𝐄𝐍𝐙 𝐆𝐀𝐌𝐄",
      "𝘿𝙀𝙂𝙀𝙉𝙕 𝙂𝘼𝙈𝙀",
      "DEGENZ GAME",
      "Degenz Game",
    ];

    const botmai = members.filter((m) => {
      return names.includes(m.displayName);
    });

    console.log(botmai.size);

    for (let i = 0; i < botmai.size; i++) {
      const bot = botmai.at(i)!;
      if (flags["dry-run"]) {
        console.log(bot.displayName);
      } else {
        await bot.ban();
        console.log(`banned ${bot.user.tag}`);
      }
    }
  }
}
