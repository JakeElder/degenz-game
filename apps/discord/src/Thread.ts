import { NPCSymbol } from "data/types";
import { TextBasedChannel, ThreadChannel } from "discord.js";
import { Global } from "./Global";

export class Thread {
  static async getOrFail(
    id: ThreadChannel["id"],
    botSymbol: NPCSymbol = "ADMIN"
  ) {
    const bot = Global.bot(botSymbol);
    const thread = (await bot.guild.channels.fetch(id)) as TextBasedChannel;

    if (!thread || !thread.isThread()) {
      throw new Error(`Thread ${id} not found.`);
    }

    return thread;
  }
}
