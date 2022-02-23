import React from "react";
import { NPC } from "db";
import { BotSymbol, ChannelSymbol } from "types";
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
    async (botSymbol: BotSymbol, channelSymbol: ChannelSymbol) => {
      const bot = Global.bot(botSymbol);
      return bot.getTextChannel(Config.channelId(channelSymbol));
    },
    { promise: true, maxAge: 1000 * 60 * 10 }
  );

  static async logToHOP(
    botSymbol: BotSymbol,
    e: keyof Events,
    message: string
  ) {
    const [npc, hop] = await Promise.all([
      NPC.findOneOrFail({ where: { symbol: botSymbol } }),
      this.getChannel("BIG_BROTHER", "HALL_OF_PRIVACY"),
    ]);
    await hop.send(`>>> ${npc.defaultEmojiId} \`${e}\` ${message}`);
  }

  static async logToChannel(
    channelSymbol: ChannelSymbol,
    botSymbol: BotSymbol,
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

  static async memberVerified(e: Event<"MEMBER_VERIFIED">) {
    await this.logToHOP(
      "BIG_BROTHER",
      e.type,
      r(<>**{e.data.member.displayName}** verified they are not a bot.</>)
    );
  }

  static async statsChecked(e: Event<"STATS_CHECKED">) {
    let message: string;
    if (e.data.checker.id === e.data.checkee.id) {
      message = r(<>**{e.data.checker.displayName}** checked their stats.</>);
    } else {
      message = r(
        <>
          **{e.data.checker.displayName}** checked **
          {e.data.checkee.displayName}**'s stats.
        </>
      );
    }
    await this.logToHOP("ALLY", e.type, message);
  }

  static async inventoryChecked(e: Event<"INVENTORY_CHECKED">) {
    let message: string;
    if (e.data.checker.id === e.data.checkee.id) {
      message = r(
        <>**{e.data.checker.displayName}** checked their inventory.</>
      );
    } else {
      message = r(
        <>
          **{e.data.checker.displayName}** checked **
          {e.data.checkee.displayName}**'s inventory.
        </>
      );
    }
    await this.logToHOP("ALLY", e.type, message);
  }

  static async allegiancePledged(e: Event<"ALLEGIANCE_PLEDGED">) {
    const message = r(
      <>
        **{e.data.user.displayName}** pledged their allegiance and received{" "}
        {Format.currency(e.data.yld)}.
      </>
    );
    await this.logToHOP("BIG_BROTHER", e.type, message);
  }
}
