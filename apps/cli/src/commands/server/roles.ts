import { Routes } from "discord-api-types/v9";
import Config from "app-config";
import { Command } from "../../lib";
import { json } from "../../utils";

export default class Roles extends Command {
  static description = "Get server roles";

  async run(): Promise<void> {
    const res = await this.get(
      Routes.guildRoles(Config.general("GUILD_ID")),
      Config.botToken("ADMIN")
    );
    this.log(json(res.data.filter((r: any) => !r.managed)));
  }
}
