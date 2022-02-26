import {
  CommandInteraction,
  GuildBasedChannel,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Bot, TossGame } from ".";
import { District, MartItem, User } from "..";

type EnterEvent = {
  type: "ENTER";
  data: {
    member: GuildMember;
  };
};

type BotReadyEvent = {
  type: "BOT_READY";
  data: {
    bot: Bot;
  };
};

type CommandNotFoundEvent = {
  type: "COMMAND_NOT_FOUND";
  data: { i: CommandInteraction };
};

type CommandNotImplementedEvent = {
  type: "COMMAND_NOT_IMPLEMENTED";
  data: { i: CommandInteraction };
};

type SendMessageAsExecutedEvent = {
  type: "SEND_MESSAGE_AS_EXECUTED";
  data: {
    bot: Bot;
    channel: GuildBasedChannel;
    message: string;
    success: boolean;
  };
};

type ApartmentAllocatedEvent = {
  type: "APARTMENT_ALLOCATED";
  data: {
    user: User;
    onboard: boolean;
  };
};

type BalanceCheckedEvent = {
  type: "BALANCE_CHECKED";
  data: {
    user: User;
  };
};

type MemberVerifiedEvent = {
  type: "MEMBER_VERIFIED";
  data: {
    member: GuildMember;
  };
};

type StatsCheckedEvent = {
  type: "STATS_CHECKED";
  data: { checker: User; checkee: User; channel: TextChannel };
};

type AllegiancePledgedEvent = {
  type: "ALLEGIANCE_PLEDGED";
  data: { user: User; yld: number };
};

type InventoryCheckedEvent = {
  type: "INVENTORY_CHECKED";
  data: { checker: User; checkee: User };
};

type MartStockCheckedEvent = {
  type: "MART_STOCK_CHECKED";
  data: {
    user: User;
  };
};

type MartItemBoughtEvent = {
  type: "MART_ITEM_BOUGHT";
  data: { user: User; item: MartItem };
};

type ItemEatenEvent = {
  type: "ITEM_EATEN";
  data: {
    user: User;
    item: MartItem;
  };
};

type TossCompletedEvent = {
  type: "TOSS_COMPLETED";
  data: {
    challenger: User;
    challengee: User | "HOUSE";
    game: TossGame;
  };
};

type RedpillTakenEvent = {
  type: "REDPILL_TAKEN";
  data: {
    user: User;
  };
};

type HelpRequestedEvent = {
  type: "HELP_REQUESTED";
  data: {
    user: User;
    channel: TextChannel;
  };
};

type GBTTransferredEvent = {
  type: "GBT_TRANSFERRED";
  data: {
    sender: User;
    recipient: User;
    amount: number;
  };
};

type FirstWorldChoiceEvent = {
  type: "FIRST_WORLD_CHOICE";
  data: {
    user: User;
    choice: string;
  };
};

type GameEnteredEvent = {
  type: "GAME_ENTERED";
  data: {
    user: User;
    district: District;
  };
};

export type Event =
  | BotReadyEvent
  | CommandNotFoundEvent
  | CommandNotImplementedEvent
  | SendMessageAsExecutedEvent
  | ApartmentAllocatedEvent
  | BalanceCheckedEvent
  | StatsCheckedEvent
  | MemberVerifiedEvent
  | AllegiancePledgedEvent
  | InventoryCheckedEvent
  | ItemEatenEvent
  | MartStockCheckedEvent
  | MartItemBoughtEvent
  | TossCompletedEvent
  | EnterEvent
  | RedpillTakenEvent
  | HelpRequestedEvent
  | GBTTransferredEvent
  | FirstWorldChoiceEvent
  | GameEnteredEvent;

type EventHandler<E extends Event> = {
  [P in E["type"]]: (e: { type: E["type"]; data: E["data"] }) => void;
};

type DegenEmitterEvents = EventHandler<BotReadyEvent> &
  EventHandler<CommandNotFoundEvent> &
  EventHandler<CommandNotImplementedEvent> &
  EventHandler<SendMessageAsExecutedEvent> &
  EventHandler<ApartmentAllocatedEvent> &
  EventHandler<BalanceCheckedEvent> &
  EventHandler<StatsCheckedEvent> &
  EventHandler<MemberVerifiedEvent> &
  EventHandler<AllegiancePledgedEvent> &
  EventHandler<InventoryCheckedEvent> &
  EventHandler<ItemEatenEvent> &
  EventHandler<MartStockCheckedEvent> &
  EventHandler<MartItemBoughtEvent> &
  EventHandler<TossCompletedEvent> &
  EventHandler<EnterEvent> &
  EventHandler<RedpillTakenEvent> &
  EventHandler<HelpRequestedEvent> &
  EventHandler<GBTTransferredEvent> &
  EventHandler<FirstWorldChoiceEvent> &
  EventHandler<GameEnteredEvent>;

export type PickEvent<T extends keyof DegenEmitterEvents> = Parameters<
  DegenEmitterEvents[T]
>[0];
