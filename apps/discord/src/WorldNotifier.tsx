import React from "react";
import { NPC } from "db";
import { BotId, ChannelId } from "types";
import memoize from "memoizee";
import Config from "app-config";
import { Events } from "./Events";
import { Global } from "./Global";
import Utils from "./Utils";
import { Format } from "lib";

const { r } = Utils;

type Event<T extends keyof Events> = Parameters<Events[T]>[0];

export default class WorldNotifier {
  static getChannel = memoize(
    async (botSymbol: BotId, channelSymbol: ChannelId) => {
      const bot = Global.bot(botSymbol);
      return bot.getTextChannel(Config.channelId(channelSymbol));
    },
    { promise: true, maxAge: 1000 * 60 * 10 }
  );

  static async logToHOP(botSymbol: BotId, e: keyof Events, message: string) {
    const [npc, hop] = await Promise.all([
      NPC.findOneOrFail({ where: { symbol: botSymbol } }),
      this.getChannel("BIG_BROTHER", "HALL_OF_PRIVACY"),
    ]);
    await hop.send(`>>> ${npc.defaultEmojiId} \`${e}\` ${message}`);
  }

  static async logToChannel(
    channelSymbol: ChannelId,
    botSymbol: BotId,
    e: keyof Events,
    message: string
  ) {
    const channel = await this.getChannel(botSymbol, channelSymbol);
    await channel.send(`\`${e}\` ${message}`);
  }

  static async balanceChecked(e: Event<"BALANCE_CHECKED">) {
    const message = r(
      <>
        **{e.data.user.displayName}** checked their balance.{" "}
        {Format.currency(e.data.user.gbt)}.
      </>
    );

    await Promise.all([
      this.logToHOP("BANKER", e.type, message),
      this.logToChannel("BANK", "BANKER", e.type, message),
    ]);
  }
}
