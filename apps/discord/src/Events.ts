import {
  CommandInteraction,
  GuildBasedChannel,
  GuildMember,
  PartialGuildMember,
  TextChannel,
} from "discord.js";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { ManagedChannelSymbol, QuestSymbol } from "data/types";
import {
  User,
  MartItem,
  District,
  Dormitory,
  NPC,
  Achievement,
  Toss,
  MintPassAssignment,
} from "data/db";

type EnterEvent = {
  type: "ENTER";
  data: {
    member: GuildMember;
    inviteCode: string | null;
    campaign: string | null;
  };
};

type ExitEvent = {
  type: "EXIT";
  data: {
    member: GuildMember | PartialGuildMember;
  };
};

type BotReadyEvent = {
  type: "BOT_READY";
  data: {
    bot: NPC;
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
    bot: NPC;
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

type DormitoryAllocatedEvent = {
  type: "DORMITORY_ALLOCATED";
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
    items: MartItem[];
    strengthBefore: number;
  };
};

type TossCompletedEvent = {
  type: "TOSS_COMPLETED";
  data: { toss: Toss };
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

type GameEnteredApartmentEvent = {
  type: "GAME_ENTERED_APARTMENT";
  data: {
    user: User;
    district: District;
  };
};

type GameEnteredDormitoryEvent = {
  type: "GAME_ENTERED_DORMITORY";
  data: {
    user: User;
    dormitory: Dormitory;
  };
};

type OrientationCompletedEvent = {
  type: "ORIENTATION_COMPLETED";
  data: {
    user: User;
    dormitory: Dormitory;
  };
};

type AchievementAwardedEvent = {
  type: "ACHIEVEMENT_AWARDED";
  data: {
    user: User;
    achievement: Achievement;
    isQuest: boolean;
  };
};

type DormReadyButtonPressedEvent = {
  type: "DORM_READY_BUTTON_PRESSED";
  data: {
    user: User;
    response: "YES" | "NO";
  };
};

type OnboardingThreadPurgedEvent = {
  type: "ONBOARDING_THREAD_PURGED";
  data: {
    user: User;
    redpilled: "YES" | "NO";
  };
};

type TokensIssuedEvent = {
  type: "TOKENS_ISSUED";
  data: {
    issuerId: string;
    recipient: User | null;
    amount: number;
  };
};

type TokensConfiscatedEvent = {
  type: "TOKENS_CONFISCATED";
  data: {
    confiscaterId: string;
    user: User;
    amount: number;
  };
};

type CitizenImprisonedEvent = {
  type: "CITIZEN_IMPRISONED";
  data: {
    captor: User;
    prisoner: User;
    reason: string;
  };
};

type CitizenEscapedEvent = {
  type: "CITIZEN_ESCAPED";
  data: {
    prisoner: User;
  };
};

type CitizenReleasedEvent = {
  type: "CITIZEN_RELEASED";
  data: {
    captor: User;
    prisoner: User;
  };
};

type QuestCompletedEvent = {
  type: "QUEST_COMPLETED";
  data: {
    user: User;
    achievement: Achievement;
    quest: QuestSymbol;
  };
};

type ReactionsRewardedEvent = {
  type: "REACTIONS_REWARDED";
  data: {
    user: User;
    yield: number;
    channelIds: ManagedChannelSymbol[];
  };
};

type GetPFPButtonClickedEvent = {
  type: "GET_PFP_BUTTON_CLICKED";
  data: {
    user: User;
  };
};

type MessageDeletedEvent = {
  type: "MESSAGE_DELETED";
  data: {
    userId?: string;
    message: string;
  };
};

type MintPassRedeemedEvent = {
  type: "MINT_PASS_REDEEMED";
  data: {
    mpa: MintPassAssignment;
  };
};

type MintPassSentEvent = {
  type: "MINT_PASS_SENT";
  data: {
    mpa: MintPassAssignment;
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
  | ExitEvent
  | RedpillTakenEvent
  | HelpRequestedEvent
  | GBTTransferredEvent
  | FirstWorldChoiceEvent
  | GameEnteredApartmentEvent
  | GameEnteredDormitoryEvent
  | DormitoryAllocatedEvent
  | OrientationCompletedEvent
  | AchievementAwardedEvent
  | DormReadyButtonPressedEvent
  | OnboardingThreadPurgedEvent
  | TokensIssuedEvent
  | TokensConfiscatedEvent
  | CitizenImprisonedEvent
  | CitizenEscapedEvent
  | CitizenReleasedEvent
  | QuestCompletedEvent
  | ReactionsRewardedEvent
  | GetPFPButtonClickedEvent
  | MessageDeletedEvent
  | MintPassRedeemedEvent
  | MintPassSentEvent;

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
  EventHandler<ExitEvent> &
  EventHandler<RedpillTakenEvent> &
  EventHandler<HelpRequestedEvent> &
  EventHandler<GBTTransferredEvent> &
  EventHandler<FirstWorldChoiceEvent> &
  EventHandler<GameEnteredApartmentEvent> &
  EventHandler<GameEnteredDormitoryEvent> &
  EventHandler<DormitoryAllocatedEvent> &
  EventHandler<OrientationCompletedEvent> &
  EventHandler<AchievementAwardedEvent> &
  EventHandler<DormReadyButtonPressedEvent> &
  EventHandler<OnboardingThreadPurgedEvent> &
  EventHandler<TokensIssuedEvent> &
  EventHandler<TokensConfiscatedEvent> &
  EventHandler<CitizenImprisonedEvent> &
  EventHandler<CitizenEscapedEvent> &
  EventHandler<CitizenReleasedEvent> &
  EventHandler<QuestCompletedEvent> &
  EventHandler<ReactionsRewardedEvent> &
  EventHandler<GetPFPButtonClickedEvent> &
  EventHandler<MintPassRedeemedEvent> &
  EventHandler<MintPassSentEvent> &
  EventHandler<MessageDeletedEvent>;

export type PickEvent<T extends keyof DegenEmitterEvents> = Parameters<
  DegenEmitterEvents[T]
>[0];

class DegenEventEmitter extends (EventEmitter as new () => TypedEmitter<DegenEmitterEvents>) {
  // @ts-ignore
  emit<E extends keyof DegenEmitterEvents>(
    event: E,
    data: Parameters<DegenEmitterEvents[E]>[0]["data"]
  ): boolean {
    // @ts-ignore
    return super.emit(event, { type: event, data });
  }
}

export default new DegenEventEmitter();
