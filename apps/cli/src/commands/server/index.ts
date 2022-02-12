import { Flags } from "@oclif/core";
import { Routes } from "discord-api-types/v9";
import { Command } from "../../lib";
import { json } from "../../utils";

export default class Info extends Command {
  static description = "Get server info";

  static flags = {
    id: Flags.string({
      description: "The id of the server",
      required: true,
    }),
    token: Flags.string({
      description: "The authentication token",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Info);
    const res = await this.get(Routes.guild(flags["id"]), flags.token);
    this.log(json(res.data));
  }
}
