import { REST, RateLimitError } from "@discordjs/rest";
import Config from "config";
import { PersistentMessage } from "data/db";
import { PersistentMessageSymbol } from "data/types";
import { Message, MessageOptions } from "discord.js";
import { Routes } from "discord-api-types/v10";
import Utils from "../Utils";

type QueuedItem = [PersistentMessageSymbol, number, NodeJS.Timeout];

export class PersistentMessageController {
  static queue: QueuedItem[] = [];

  static async create(id: PersistentMessageSymbol, value: MessageOptions) {
    const pm = await PersistentMessage.findOneOrFail({ where: { id } });

    const channel = await Utils.ManagedChannel.getOrFail(
      pm.channel.id,
      pm.maintainer.id
    );

    const message = await channel.send(value);

    pm.messageId = message.id;
    await pm.save();

    return message;
  }

  static async set(
    id: PersistentMessageSymbol,
    value: MessageOptions | (() => Promise<MessageOptions>),
    fromQueue = false
  ) {
    const pm = await PersistentMessage.findOneOrFail({ where: { id } });

    const channel = await Utils.ManagedChannel.getOrFail(
      pm.channel.id,
      pm.maintainer.id
    );

    let message: Message;

    if (!pm.messageId) {
      const options = typeof value === "function" ? await value() : value;
      message = await channel.send(options);
      pm.messageId = message.id;
      await pm.save();
      return message;
    }

    try {
      message = await channel.messages.fetch(pm.messageId);
    } catch (e) {
      console.log(`Persistent message ${id} not found`);
      return;
    }

    if (this.queue.some((q) => q[0] === id) && fromQueue !== true) {
      return;
    }

    const rest = new REST({ version: "10", rejectOnRateLimit: ["/"] }).setToken(
      Config.botToken(pm.maintainer.id)
    );

    const options = typeof value === "function" ? await value() : value;

    try {
      await rest.patch(
        Routes.channelMessage(Config.channelId(pm.channel.id), pm.messageId),
        { body: options }
      );
      this.queue = this.queue.filter((q) => q[0] !== id);
    } catch (e) {
      if (e instanceof RateLimitError) {
        console.log(
          `Rate Limited Persistent Message ${id}, waiting ${e.timeToReset}`
        );
        this.queueUpdate(id, e.timeToReset, value);
      }
      console.log(e);
      if (pm.id === "GET_PFP") {
        console.log("error");
      }
    }

    return message;
  }

  static queueUpdate(
    id: PersistentMessageSymbol,
    time: number,
    value: MessageOptions | (() => Promise<MessageOptions>)
  ) {
    const idx = this.queue.findIndex((q) => q[0] === id);

    const q: QueuedItem = [
      id,
      time,
      setTimeout(() => {
        this.set(id, value, true);
      }, time),
    ];

    if (idx > -1) {
      clearTimeout(this.queue[idx][2]);
      this.queue.splice(idx, 1);
    }

    this.queue.push(q);
  }
}
