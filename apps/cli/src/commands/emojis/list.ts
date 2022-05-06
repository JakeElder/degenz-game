import { Command } from "../../lib";

export default class ListEmojis extends Command {
  static description = "List emojis";

  async run(): Promise<void> {
    const bot = await this.bot("ADMIN");
    console.log(
      await Promise.all(
        bot.emojis.cache.map(async (e) => ({
          name: e.name,
          id: e.id,
          uploader: (await e.fetchAuthor()).username,
        }))
      )
    );
  }
}
