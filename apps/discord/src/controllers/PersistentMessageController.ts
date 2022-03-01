import { PersistentMessage } from "data/db";
import { PersistentMessageSymbol } from "data/types";
import Config from "app-config";
import { Global } from "../Global";
import { Message, MessageOptions } from "discord.js";

export class PersistentMessageController {
  static async set(
    symbol: PersistentMessageSymbol,
    value: MessageOptions,
    options: { replace?: boolean } = { replace: false }
  ) {
    const pm = await PersistentMessage.findOneOrFail({ where: { symbol } });

    let message: Message;

    if (pm.messageId === null) {
      return this.create(pm, value);
    }

    const channelId = Config.channelId(pm.channelSymbol);
    const bot = Global.bot(pm.maintainerSymbol);
    const channel = await bot.getTextChannel(channelId);

    if (options.replace) {
      try {
        message = await channel.messages.fetch(pm.messageId);
        await message.delete();
      } catch (e) {}
      return this.create(pm, value);
    }

    try {
      message = await channel.messages.fetch(pm.messageId);
      await message.edit(value);
    } catch (e) {
      return this.create(pm, value);
    }

    return message;
  }

  static async create(pm: PersistentMessage, value: MessageOptions) {
    const bot = Global.bot(pm.maintainerSymbol);
    const channelId = Config.channelId(pm.channelSymbol);
    const channel = await bot.getTextChannel(channelId);
    const message = await channel.send(value);
    pm.messageId = message.id;
    await pm.save();
    return message;
  }
}
