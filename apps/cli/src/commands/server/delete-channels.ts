import { CliUx, Flags } from "@oclif/core";
import { Routes } from "discord-api-types/v9";
import Listr from "listr";
import { Command } from "../../lib";
import _ from "discord.js";

export default class DeleteChannels extends Command {
  static description = "Delete categories and channels";

  static flags = {
    "server-id": Flags.string({
      description: "The id of the server",
      required: true,
    }),
    token: Flags.string({
      description: "The authentication token",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(DeleteChannels);

    const res = await this.get(
      Routes.guildChannels(flags["server-id"]),
      flags.token
    );

    const cnfrm = await CliUx.ux.prompt(
      `Deleting ${res.data.length} channels. Are you sure? Y/n`
    );

    if (cnfrm !== "Y") {
      return;
    }

    const listr = new Listr(
      res.data.map((c: any) => {
        return {
          title: c.name,
          task: async () => {
            await this.delete(Routes.channel(c.id), flags.token);
          },
        };
      }),
      { concurrent: true }
    );

    await listr.run();
  }
}
