import { Routes } from "discord-api-types/v9";
import Listr from "listr";
import Config from "app-config";
import { Command } from "../../lib";

export default class DeleteEmojis extends Command {
  static description = "Delete emojis";

  async run(): Promise<void> {
    const guildId = Config.general("GUILD_ID");

    const r = await this.get(
      Routes.guildEmojis(guildId),
      Config.botToken("ADMIN")
    );

    const listr = new Listr(
      r.data.map((emoji: any): Listr.ListrTask => {
        return {
          title: emoji.name,
          task: async (_, task) => {
            await this.delete(
              Routes.guildEmoji(guildId, emoji.id),
              Config.botToken("ADMIN"),
              task
            );
          },
        };
      }),
      { exitOnError: false }
    );

    await listr.run();
  }
}
