import {
  BaseCommandInteraction,
  CommandInteraction,
  GuildMember,
  MessageOptions,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { User } from "..";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIApplicationCommandPermission } from "discord-api-types/v9";
import { SetOptional } from "type-fest";
import { NPCSymbol } from "../entity/NPC";
import { DormitorySymbol } from "../entity/Dormitory";
import { DistrictSymbol } from "../entity/District";
import { EmojiSymbol } from "../entity/Emoji";
import { MartItemSymbol } from "../entity/MartItem";
import {
  BaseRoleSymbol,
  CitizenRoleSymbol,
  EveryoneRoleSymbol,
  ManagedRoleSymbol,
  RoleTypeSymbol,
  SupplementaryRoleSymbol,
  RoleSymbol,
} from "../entity/Role";
import { ApartmentTenancyLevelSymbol } from "../entity/ApartmentTenancy";
import { AchievementSymbol } from "../entity/Achievement";
import {
  ManagedChannelSymbol,
  ManagedCategorySymbol,
  NestedManagedChannelSymbol,
} from "../entity/ManagedChannel";
import { PersistentMessageSymbol } from "../entity/PersistentMessage";

export type {
  DormitorySymbol,
  DistrictSymbol,
  NPCSymbol,
  EmojiSymbol,
  MartItemSymbol,
  BaseRoleSymbol,
  CitizenRoleSymbol,
  EveryoneRoleSymbol,
  ManagedRoleSymbol,
  RoleTypeSymbol,
  SupplementaryRoleSymbol,
  ApartmentTenancyLevelSymbol,
  RoleSymbol,
  AchievementSymbol,
  ManagedChannelSymbol,
  ManagedCategorySymbol,
  NestedManagedChannelSymbol,
  PersistentMessageSymbol,
};

export type EnvVars = SetOptional<
  Record<
    | `${NPCSymbol}_BOT_TOKEN`
    | "CA_CERT"
    | "DATABASE_URL"
    | "MONGO_URI"
    | "MIXPANEL_PROJECT_TOKEN"
    | "ROLLBAR_TOKEN"
    | "WEB_URL",
    string
  >,
  "CA_CERT"
> & { NODE_ENV: "stage" | "production" | "development" };

export type GeneralConfig = {
  DISTRICT_CAPACITY: number;
  GUILD_ID: string;
  PROD_GUILD_ID: string;
  READ_ONLY: boolean;
  SKIP_DELAY: boolean;
  USE_SCOUT: boolean;
  WORLD_NAME: string;
};

type RestrictedRestrictionCheckResponse = {
  restricted: true;
  response: Parameters<BaseCommandInteraction["reply"]>[0];
};

type UnrestrictedRestrictionCheckResponse = false;

type RestrictionCheckResponse =
  | RestrictedRestrictionCheckResponse
  | UnrestrictedRestrictionCheckResponse;

export type Restriction = (
  i: CommandInteraction,
  channelDescriptor: ChannelDescriptor,
  user: User,
  interactee: User | null
) => Promise<RestrictionCheckResponse>;

export type Command = {
  id: string;
  permissions: (APIApplicationCommandPermission & { id: RoleSymbol })[];
  data: ReturnType<SlashCommandBuilder["toJSON"]>;
};

type SuccessfulOperationResult = {
  success: true;
};

type FailedOperationResult<T extends string = string> = {
  success: false;
  code: T;
};

type ExceptionOperationResult = {
  success: false;
  code: "EXCEPTION";
  message?: string;
};

export type OperationResult<T extends string = string> =
  | SuccessfulOperationResult
  | FailedOperationResult<T>
  | ExceptionOperationResult;

export type Tosser = {
  member: GuildMember;
  user: User | null;
  balanceAvailable: null | boolean;
};

export type TossGame = {
  amount: number;
  rake: number;
  member: GuildMember;
  challenger: Tosser;
  challengee: Tosser;
  choice: "UNDECIDED" | "HEADS" | "TAILS";
  result: "UNDECIDED" | "HEADS" | "TAILS";
  winner: "UNDECIDED" | "CHALLENGER" | "CHALLENGEE";
  againstHouse: boolean;
  accepted: null | boolean;
};

export type TossResult = {
  challenger: GuildMember;
  challengee: GuildMember;
  winner: "CHALLENGER" | "CHALLENGEE";
  amount: number;
  rake: number;
};

export type ChannelDescriptor = {
  id: string;
  name: string;
  channel: TextChannel | ThreadChannel;
  isCommunity: boolean;
  isApartment: boolean;
  isDormitory: boolean;
  isOnboardingThread: boolean;
  isCell: boolean;
  isInPrison: boolean;
  isInGame: boolean;
  isTossHouse: boolean;
  isTownSquare: boolean;
  isMart: boolean;
  isArena: boolean;
  isArmory: boolean;
  isTrainingDojo: boolean;
  isGenPop: boolean;
  isBank: boolean;
  isTavern: boolean;
};

export type QuestLogMessage = {
  meta: {
    quest: QuestSymbol;
    expanded: boolean;
  };
  data: MessageOptions;
};

export type QuestLogState = QuestLogMessage[];

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export type QuestSymbol =
  | "JOIN_THE_DEGENZ"
  | "PLEDGE"
  | "LEARN_TO_HACKER_BATTLE"
  | "TOSS_WITH_TED"
  | "SHOP_AT_MERRIS_MART"
  | "GET_WHITELIST";
