import React from "react";
import { GuildMember, TextBasedChannel } from "discord.js";
import emoji from "node-emoji";
import Config from "app-config";
import { Channel } from "./templates";
import { currency } from "./utils";
import { MartItem, TossGame, User } from "./types";

type WorldEvent<T extends string, U> = {
  event: T;
  data: U;
};

export type EnterEvent = WorldEvent<
  "ENTER",
  {
    member: GuildMember;
  }
>;

export type VerifyEvent = WorldEvent<
  "VERIFY",
  {
    member: GuildMember;
  }
>;

export type ObeyEvent = WorldEvent<
  "OBEY",
  {
    member: GuildMember;
  }
>;

export type RedpillEvent = WorldEvent<
  "REDPILL",
  {
    member: GuildMember;
  }
>;

export type HelpRequestedEvent = WorldEvent<
  "HELP_REQUESTED",
  {
    member: GuildMember;
    channel: TextBasedChannel;
  }
>;

export type BalanceCheckedEvent = WorldEvent<
  "BALANCE_CHECKED",
  {
    member: GuildMember;
    balance: number;
  }
>;

export type StatsCheckedEvent = WorldEvent<
  "STATS_CHECKED",
  {
    member: GuildMember;
    checkee: GuildMember | null;
  }
>;

export type TokenTransferEvent = WorldEvent<
  "TOKEN_TRANSFER",
  {
    member: GuildMember;
    recipient: GuildMember;
    amount: User["tokens"];
  }
>;

export type MartStockCheckedEvent = WorldEvent<
  "MART_STOCK_CHECKED",
  {
    member: GuildMember;
  }
>;

export type MartItemPurchasedEvent = WorldEvent<
  "MART_ITEM_PURCHASED",
  {
    member: GuildMember;
    item: MartItem;
  }
>;

export type ItemEatenEvent = WorldEvent<
  "ITEM_EATEN",
  {
    member: GuildMember;
    item: MartItem;
  }
>;

export type InventoryCheckedEvent = WorldEvent<
  "INVENTORY_CHECKED",
  {
    member: GuildMember;
    checkee: GuildMember | null;
  }
>;

export type TossCompletedEvent = WorldEvent<"TOSS_COMPLETED", TossGame>;

export type JoinedTheDegenzEvent = WorldEvent<
  "JOINED_THE_DEGENZ",
  {
    member: GuildMember;
  }
>;

export type FirstWorldChoiceEvent = WorldEvent<
  "FIRST_WORLD_CHOICE",
  {
    member: GuildMember;
    choice: string;
  }
>;

export type WorldEventMessage =
  | EnterEvent
  | VerifyEvent
  | ObeyEvent
  | RedpillEvent
  | HelpRequestedEvent
  | StatsCheckedEvent
  | BalanceCheckedEvent
  | TokenTransferEvent
  | MartStockCheckedEvent
  | MartItemPurchasedEvent
  | ItemEatenEvent
  | InventoryCheckedEvent
  | TossCompletedEvent
  | JoinedTheDegenzEvent
  | FirstWorldChoiceEvent;

export type WorldEventId = WorldEventMessage["event"];

const Log = ({
  event,
  children,
}: {
  event: WorldEventId;
  children: React.ReactNode;
}) => {
  const e = emoji.get("hash");
  return (
    <>
      {e} `{event}` {children}
    </>
  );
};

export const HallOfPrivacyLog = (e: WorldEventMessage) => {
  if (e.event === "ENTER") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** entered the server.
      </Log>
    );
  }

  if (e.event === "VERIFY") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** verified they are not a bot.
      </Log>
    );
  }

  if (e.event === "OBEY") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** pledged to **obey** and entered **
        {Config.general("WORLD_NAME")}**.
      </Log>
    );
  }

  if (e.event === "REDPILL") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** took the red pill.
      </Log>
    );
  }

  if (e.event === "HELP_REQUESTED") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** requested help in{" "}
        <Channel id={e.data.channel.id} />.
      </Log>
    );
  }

  if (e.event === "STATS_CHECKED") {
    if (e.data.checkee === null) {
      return (
        <Log event={e.event}>
          **{e.data.member.displayName}** checked their stats.
        </Log>
      );
    }
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** checked **{e.data.checkee.displayName}
        's** stats.
      </Log>
    );
  }

  if (e.event === "BALANCE_CHECKED") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** checked their balance. {e.data.balance}
        **{currency({ long: false, bold: false, copyright: false })}**.
      </Log>
    );
  }

  if (e.event === "TOKEN_TRANSFER") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** transferred **
        {e.data.amount} {currency({ long: false, bold: false })}** to **
        {e.data.recipient.displayName}**.
      </Log>
    );
  }

  if (e.event === "MART_STOCK_CHECKED") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** checked the stock at{" "}
        <Channel id={Config.channelId("MART")} />.
      </Log>
    );
  }

  if (e.event === "MART_ITEM_PURCHASED") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** bought **{e.data.item.name}** from
        <Channel id={Config.channelId("MART")} />.
      </Log>
    );
  }

  if (e.event === "ITEM_EATEN") {
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** ate **{e.data.item.name}**.
      </Log>
    );
  }

  if (e.event === "INVENTORY_CHECKED") {
    if (e.data.checkee === null) {
      return (
        <Log event={e.event}>
          **{e.data.member.displayName}** checked their inventory.
        </Log>
      );
    }
    return (
      <Log event={e.event}>
        **{e.data.member.displayName}** checked **{e.data.checkee.displayName}
        's** inventory.
      </Log>
    );
  }

  if (e.event === "TOSS_COMPLETED") {
    return (
      <Log event={e.event}>
        **{e.data.challenger.member.displayName}** challenged **
        {e.data.challengee.member.displayName}** to a toss and{" "}
        {e.data.winner === "CHALLENGER" ? "won" : "lost"} **{e.data.amount}{" "}
        {currency({ long: false, bold: false, copyright: false })}**.
      </Log>
    );
  }

  return <></>;
};

export default HallOfPrivacyLog;
