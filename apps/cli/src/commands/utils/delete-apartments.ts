import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Command } from "../../lib";
import { Flags } from "@oclif/core";
import Config from "config";

export default class DeleteApartments extends Command {
  static description = "Delete Apartments";

  static flags = {
    "dry-run": Flags.boolean({ default: false }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(DeleteApartments);

    if (flags["dry-run"]) {
      return;
    }

    const admin = await this.bot("ADMIN");

    const rest = new REST({ version: "10", rejectOnRateLimit: ["/"] }).setToken(
      Config.botToken("ADMIN")
    );

    const res: any = await rest.get(
      Routes.guildChannels(Config.env("GUILD_ID"))
    );

    for (let i = 0; i < res.length; i++) {
      const c = await admin.guild.channels.fetch(res[i].id);
      if (!c) {
        continue;
      }
      if (c.name.endsWith("apartment")) {
        await c.delete();
        console.log(`Deleted ${c.name}`);
      }
    }
  }
}
