import {
  CommandInteraction,
  GuildBasedChannel,
  GuildMember,
  TextChannel,
} from "discord.js";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { Bot } from "types";
import { User, MartItem, District } from "db";
import { TossGame } from "types";

export type Event<T extends string, D> = {
  [P in T]: (e: { type: T; data: D }) => void;
};

type EnterEvent = Event<
  "ENTER",
  {
    member: GuildMember;
  }
>;

type BotReadyEvent = Event<
  "BOT_READY",
  {
    bot: Bot;
  }
>;

type CommandNotFoundEvent = Event<
  "COMMAND_NOT_FOUND",
  { i: CommandInteraction }
>;

type CommandNotImplementedEvent = Event<
  "COMMAND_NOT_IMPLEMENTED",
  { i: CommandInteraction }
>;

type SendMessageAsExecutedEvent = Event<
  "SEND_MESSAGE_AS_EXECUTED",
  {
    bot: Bot;
    channel: GuildBasedChannel;
    message: string;
    success: boolean;
  }
>;

type ApartmentAllocatedEvent = Event<
  "APARTMENT_ALLOCATED",
  {
    user: User;
    onboard: boolean;
  }
>;

type BalanceCheckedEvent = Event<
  "BALANCE_CHECKED",
  {
    user: User;
  }
>;

type MemberVerifiedEvent = Event<
  "MEMBER_VERIFIED",
  {
    member: GuildMember;
  }
>;

type StatsCheckedEvent = Event<
  "STATS_CHECKED",
  { checker: User; checkee: User; channel: TextChannel }
>;

type AllegiancePledgedEvent = Event<
  "ALLEGIANCE_PLEDGED",
  { user: User; yld: number }
>;

type InventoryCheckedEvent = Event<
  "INVENTORY_CHECKED",
  { checker: User; checkee: User }
>;

type MartStockCheckedEvent = Event<
  "MART_STOCK_CHECKED",
  {
    user: User;
  }
>;

type MartItemBoughtEvent = Event<
  "MART_ITEM_BOUGHT",
  { user: User; item: MartItem }
>;

type ItemEatenEvent = Event<
  "ITEM_EATEN",
  {
    user: User;
    item: MartItem;
  }
>;

type TossCompletedEvent = Event<
  "TOSS_COMPLETED",
  {
    challenger: User;
    challengee: User | "HOUSE";
    game: TossGame<User>;
  }
>;

type RedpillTakenEvent = Event<
  "REDPILL_TAKEN",
  {
    user: User;
  }
>;

type HelpRequestedEvent = Event<
  "HELP_REQUESTED",
  {
    user: User;
    channel: TextChannel;
  }
>;

type GBTTransferredEvent = Event<
  "GBT_TRANSFERRED",
  {
    sender: User;
    recipient: User;
    amount: number;
  }
>;

type FirstWorldChoiceEvent = Event<
  "FIRST_WORLD_CHOICE",
  {
    user: User;
    choice: string;
  }
>;

type GameEnteredEvent = Event<
  "GAME_ENTERED",
  {
    user: User;
    district: District;
  }
>;

export type Events = BotReadyEvent &
  CommandNotFoundEvent &
  CommandNotImplementedEvent &
  SendMessageAsExecutedEvent &
  ApartmentAllocatedEvent &
  BalanceCheckedEvent &
  StatsCheckedEvent &
  MemberVerifiedEvent &
  AllegiancePledgedEvent &
  InventoryCheckedEvent &
  ItemEatenEvent &
  MartStockCheckedEvent &
  MartItemBoughtEvent &
  TossCompletedEvent &
  EnterEvent &
  RedpillTakenEvent &
  HelpRequestedEvent &
  GBTTransferredEvent &
  FirstWorldChoiceEvent &
  GameEnteredEvent;

class DegenEventEmitter extends (EventEmitter as new () => TypedEmitter<Events>) {
  // @ts-ignore
  emit<E extends keyof Events>(
    event: E,
    data: Parameters<Events[E]>[0]["data"]
  ): boolean {
    // @ts-ignore
    return super.emit(event, { type: event, data });
  }
}

export default new DegenEventEmitter();
