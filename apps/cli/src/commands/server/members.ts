import { Routes } from "discord-api-types/v9";
import { Command } from "../../lib";
import Config from "config";

export default class InitUsers extends Command {
  static description = "Inits non game users";

  async run(): Promise<void> {
    const res = await this.get(
      `${Routes.guildMembers(Config.general("GUILD_ID"))}?limit=1000`,
      Config.botToken("ADMIN")
    );

    console.log(JSON.stringify(res.data, null, 2));
  }
}
