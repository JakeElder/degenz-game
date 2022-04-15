import { PersistentMessage } from "data/db";
import { PersistentMessageSymbol } from "data/types";
import Config from "config";
import { Global } from "../Global";
import { Message, MessageOptions } from "discord.js";

export class PersistentMessageController {
  static async set(
    id: PersistentMessageSymbol,
    value: MessageOptions,
    options: { replace?: boolean } = { replace: false }
  ) {
    if (Config.general("READ_ONLY")) {
      return;
    }

    const pm = await PersistentMessage.findOneOrFail({ where: { id } });

    let message: Message;

    if (pm.messageId === null) {
      return this.create(pm, value);
    }

    const channelId = Config.channelId(pm.channel.id);
    const bot = Global.bot(pm.maintainer.id);
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
    const bot = Global.bot(pm.maintainer.id);
    const channelId = Config.channelId(pm.channel.id);
    const channel = await bot.getTextChannel(channelId);
    const message = await channel.send(value);
    pm.messageId = message.id;
    await pm.save();
    return message;
  }
}
