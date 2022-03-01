import { Routes } from "discord-api-types/v9";
import Config from "config";
import { Command } from "../../lib";
import { json } from "../../utils";
import { Flags } from "@oclif/core";

export default class Roles extends Command {
  static description = "Get server roles";

  static flags = {
    format: Flags.string({
      description: "How to display",
      options: ["json", "config"],
      default: "json",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Roles);

    const res = await this.get(
      Routes.guildRoles(Config.general("GUILD_ID")),
      Config.botToken("ADMIN")
    );

    if (flags.format === "json") {
      this.log(json(res.data));
      return;
    }

    const c = res.data.map((r: any) => {
      const symbol = Config.reverseClientId(r.tags?.bot_id);
      if (symbol) {
        return { [`${symbol}_BOT`]: r.id };
      }
    });

    console.log(Object.assign({}, ...c));
  }
}
