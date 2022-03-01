import { Routes } from "discord-api-types/v9";
import Config from "config";
import { Command } from "../../lib";
import { json } from "../../utils";

export default class Info extends Command {
  static description = "Get server info";

  async run(): Promise<void> {
    const res = await this.get(
      Routes.guild(Config.general("GUILD_ID")),
      Config.botToken("ADMIN")
    );
    this.log(json(res.data));
  }
}
