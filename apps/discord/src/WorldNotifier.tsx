import React from "react";
import { NPC } from "data/db";
import memoize from "memoizee";
import Config from "config";
import { Event, PickEvent } from "./Events";
import Utils from "./Utils";
import { Format } from "lib";
import { channelMention, userMention } from "@discordjs/builders";
import { NestedManagedChannelSymbol, NPCSymbol } from "data/types";
import listify from "listify";

const { r } = Utils;

export default class WorldNotifier {
  static getChannel = memoize(
    async (botSymbol: NPCSymbol, channelSymbol: NestedManagedChannelSymbol) => {
      return Utils.ManagedChannel.getOrFail(channelSymbol, botSymbol);
    },
    { promise: true, maxAge: 1000 * 60 * 10 }
  );

  static async logToHOP(
    botSymbol: NPCSymbol,
    e: Event["type"],
    message: string
  ) {
    const [npc, hop] = await Promise.all([
      NPC.findOneOrFail({ where: { id: botSymbol } }),
      this.getChannel("BIG_BROTHER", "HALL_OF_PRIVACY"),
    ]);
    await hop.send(`>>> ${npc.emoji} \`${e}\` ${message}`);
  }

  static async logToChannel(
    channelSymbol: NestedManagedChannelSymbol,
    botSymbol: NPCSymbol,
    e: Event["type"],
    message: string
  ) {
    const channel = await this.getChannel(botSymbol, channelSymbol);
    return channel.send(`\`${e}\` ${message}`);
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
    const hopMessage = r(
      <>
        **{e.data.user.displayName}** checked the stock at{" "}
        {channelMention(Config.channelId("MART"))}.
      </>
    );

    const martMessage = r(
      <>**{e.data.user.displayName}** checked the stock.</>
    );

    await Promise.all([
      this.logToHOP("MART_CLERK", e.type, hopMessage),
      this.logToChannel("MART", "MART_CLERK", e.type, martMessage),
    ]);
  }

  static async martItemBought(e: PickEvent<"MART_ITEM_BOUGHT">) {
    const message = r(
      <>
        **{e.data.user.displayName}** bought **{e.data.item.name}**.
      </>
    );
    await Promise.all([
      this.logToHOP("MART_CLERK", e.type, message),
      this.logToChannel("MART", "MART_CLERK", e.type, message),
    ]);
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

    await Promise.all([
      this.logToHOP("TOSSER", e.type, message),
      this.logToChannel("TOSS_HOUSE", "TOSSER", e.type, message),
    ]);
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

  static async gameEnteredApartment(e: PickEvent<"GAME_ENTERED_APARTMENT">) {
    const message = r(
      <>
        **{e.data.user.displayName}** entered {e.data.district.emoji.toString()}
        .
      </>
    );
    await this.logToHOP("BIG_BROTHER", e.type, message);
  }

  static async gameEnteredDormitory(e: PickEvent<"GAME_ENTERED_DORMITORY">) {
    const message = r(
      <>
        **{e.data.user.displayName}** entered{" "}
        {channelMention(e.data.dormitory.channel.discordChannel.id)}.
      </>
    );
    await this.logToHOP("BIG_BROTHER", e.type, message);
  }

  static async citizenImprisoned(e: PickEvent<"CITIZEN_IMPRISONED">) {
    const message = r(
      <>
        **{e.data.captor.displayName}** imprisoned **
        {e.data.prisoner.displayName}
        ** for `{e.data.reason}`.
      </>
    );
    await this.logToHOP("WARDEN", e.type, message);

    if (e.data.prisoner.primaryTenancy.type === "DORMITORY") {
      await this.logToChannel(
        e.data.prisoner.primaryTenancy.dormitory.id,
        "WARDEN",
        e.type,
        message
      );
    }
  }

  static async citizenReleased(e: PickEvent<"CITIZEN_RELEASED">) {
    const message = r(
      <>
        **{e.data.captor.displayName}** released **{" "}
        {e.data.prisoner.displayName} ** from prison.
      </>
    );
    await this.logToHOP("WARDEN", e.type, message);

    if (e.data.prisoner.primaryTenancy.type === "DORMITORY") {
      await this.logToChannel(
        e.data.prisoner.primaryTenancy.dormitory.id,
        "WARDEN",
        e.type,
        message
      );
    }
  }

  static async citizenEscaped(e: PickEvent<"CITIZEN_ESCAPED">) {
    const message = r(
      <>**{e.data.prisoner.displayName}** escaped from prison.</>
    );
    await this.logToHOP("PRISONER", e.type, message);

    if (e.data.prisoner.primaryTenancy.type === "DORMITORY") {
      await this.logToChannel(
        e.data.prisoner.primaryTenancy.dormitory.id,
        "PRISONER",
        e.type,
        message
      );
    }
  }

  static async achievementAwarded(e: PickEvent<"ACHIEVEMENT_AWARDED">) {
    if (!/LEVEL_\d+_REACHED/.test(e.data.achievement.id)) {
      return;
    }

    const [_, level] = e.data.achievement.id.split("_");

    const role = Config.roles.find((r) => r.id === `ENGAGEMENT_LEVEL_${level}`);

    if (!role) {
      throw new Error(`ENGAGEMENT_LEVEL_${level} role not found.`);
    }

    const message = r(
      <>
        {e.data.user.mention} got the {Config.emojiCode(role.emoji.id)} `
        {e.data.achievement.id}` achievement.
        {Format.transaction(
          e.data.user.gbt - e.data.achievement.reward,
          e.data.achievement.reward
        )}
      </>
    );

    await this.logToHOP("ALLY", e.type, message);
  }

  static async questCompleted(e: PickEvent<"QUEST_COMPLETED">) {
    const message = r(
      <>
        {e.data.user.mention} completed the `{e.data.quest}` quest.{" "}
        {Format.transaction(
          e.data.user.gbt - e.data.achievement.reward,
          e.data.achievement.reward
        )}
      </>
    );
    await this.logToHOP("ALLY", e.type, message);
  }

  static async reactionsRewarded(e: PickEvent<"REACTIONS_REWARDED">) {
    const channels = e.data.channelIds.map((c) =>
      channelMention(Config.channelId(c))
    );
    const message = r(
      <>
        {e.data.channelIds.join(",")}
        {userMention(e.data.user.id)} earnt {Config.emojiCode("GBT_COIN")} for
        reacting in {listify(channels)}.{" "}
        {Format.transaction(e.data.user.gbt - e.data.yield, e.data.yield)}
      </>
    );
    await this.logToHOP("BIG_BROTHER", e.type, message);
  }
}
