import { Routes } from "discord-api-types/v9";
import Config from "app-config";
import { Command } from "../../lib";

export default class Emojis extends Command {
  static description = "List emojis";

  async run(): Promise<void> {
    const guildId = Config.general("GUILD_ID");

    const r = await this.get(
      Routes.guildEmojis(guildId),
      Config.botToken("ADMIN")
    );

    console.log(r.data);
  }
}
