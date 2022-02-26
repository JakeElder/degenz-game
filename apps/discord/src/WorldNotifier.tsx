import React from "react";
import { NPC } from "data/db";
import { BotSymbol, ChannelSymbol } from "data/types";
import memoize from "memoizee";
import Config from "app-config";
import { Event, PickEvent } from "./Events";
import { Global } from "./Global";
import Utils from "./Utils";
import { Format } from "lib";
import { channelMention, userMention } from "@discordjs/builders";

const { r } = Utils;

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
    e: Event["type"],
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
    e: Event["type"],
    message: string
  ) {
    const channel = await this.getChannel(botSymbol, channelSymbol);
    await channel.send(`\`${e}\` ${message}`);
  }

  static async balanceChecked(e: PickEvent<"BALANCE_CHECKED">) {
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

  static async gbtTransferred(e: PickEvent<"GBT_TRANSFERRED">) {
    const message = r(
      <>
        **{e.data.sender.displayName}** transferred{" "}
        {Format.currency(e.data.amount)} to **{e.data.recipient.displayName}**.
      </>
    );

    await Promise.all([
      this.logToHOP("BANKER", e.type, message),
      this.logToChannel("BANK", "BANKER", e.type, message),
    ]);
  }

  static async memberVerified(e: PickEvent<"MEMBER_VERIFIED">) {
    await this.logToHOP(
      "BIG_BROTHER",
      e.type,
      r(<>**{e.data.member.displayName}** verified they are not a bot.</>)
    );
  }

  static async statsChecked(e: PickEvent<"STATS_CHECKED">) {
    let message: string;
    if (e.data.checker.id === e.data.checkee.id) {
      message = r(
        <>
          **{e.data.checker.displayName}** checked their stats in{" "}
          {channelMention(e.data.channel.id)}.
        </>
      );
    } else {
      message = r(
        <>
          **{e.data.checker.displayName}** checked **
          {e.data.checkee.displayName}**'s stats in{" "}
          {channelMention(e.data.channel.id)}.
        </>
      );
    }
    await this.logToHOP("ALLY", e.type, message);
  }

  static async inventoryChecked(e: PickEvent<"INVENTORY_CHECKED">) {
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

  static async allegiancePledged(e: PickEvent<"ALLEGIANCE_PLEDGED">) {
    const message = r(
      <>
        **{e.data.user.displayName}** pledged their allegiance and received{" "}
        {Format.currency(e.data.yld)}.
      </>
    );
    await this.logToHOP("BIG_BROTHER", e.type, message);
  }

  static async itemEaten(e: PickEvent<"ITEM_EATEN">) {
    const message = r(
      <>
        **{e.data.user.displayName}** ate **{e.data.item.name}**.
      </>
    );
    await this.logToHOP("ALLY", e.type, message);
  }

  static async martStockChecked(e: PickEvent<"MART_STOCK_CHECKED">) {
    const message = r(
      <>
        **{e.data.user.displayName}** checked the stock at{" "}
        {channelMention(Config.channelId("MART"))}.
      </>
    );
    await this.logToHOP("MART_CLERK", e.type, message);
  }

  static async martItemBought(e: PickEvent<"MART_ITEM_BOUGHT">) {
    const message = r(
      <>
        **{e.data.user.displayName}** bought **{e.data.item.name}**.
      </>
    );
    await this.logToHOP("MART_CLERK", e.type, message);
  }

  static async tossCompleted(e: PickEvent<"TOSS_COMPLETED">) {
    let message: string;
    if (e.data.challengee === "HOUSE") {
      message = r(
        <>
          **{e.data.challenger.displayName}** challenged{" "}
          {userMention(Config.clientId("TOSSER"))} and **
          {e.data.game.winner === "CHALLENGER" ? "won" : "lost"}**{" "}
          {Format.currency(e.data.game.amount)}.
        </>
      );
    } else {
      message = r(
        <>
          **{e.data.challenger.displayName}** challenged **
          {e.data.challengee.displayName}** and **
          {e.data.game.winner === "CHALLENGER" ? "won" : "lost"}**{" "}
          {Format.currency(e.data.game.amount)}.
        </>
      );
    }

    await this.logToHOP("MART_CLERK", e.type, message);
  }

  static async redpillTaken(e: PickEvent<"REDPILL_TAKEN">) {
    const message = r(
      <>
        **{e.data.user.displayName}** took the red pill {"\u{1f48a}"}.
      </>
    );
    await this.logToHOP("ALLY", e.type, message);
  }

  static async helpRequested(e: PickEvent<"HELP_REQUESTED">) {
    const message = r(
      <>
        **{e.data.user.displayName}** requested help in{" "}
        {channelMention(e.data.channel.id)}.
      </>
    );
    await this.logToHOP("ALLY", e.type, message);
  }

  static async gameEntered(e: PickEvent<"GAME_ENTERED">) {
    const message = r(
      <>
        **{e.data.user.displayName}** entered {e.data.district.inactiveEmoji}.
      </>
    );
    await this.logToHOP("BIG_BROTHER", e.type, message);
  }
}
