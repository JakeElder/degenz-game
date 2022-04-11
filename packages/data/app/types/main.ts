import {
  BaseCommandInteraction,
  ClientOptions,
  CommandInteraction,
  GuildMember,
  OverwriteResolvable,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIApplicationCommandPermission } from "discord-api-types/v9";
import { SetOptional } from "type-fest";
import { NPCSymbol } from "../entity/NPC";
import { DormitorySymbol } from "../entity/Dormitory";
import { DistrictSymbol } from "../entity/District";
import { EmojiSymbol } from "../entity/Emoji";
import { User } from "..";

export type { DormitorySymbol, DistrictSymbol, NPCSymbol, EmojiSymbol };

export type EnvVars = SetOptional<
  Record<
    | `${NPCSymbol}_BOT_TOKEN`
    | "CA_CERT"
    | "DATABASE_URL"
    | "MONGO_URI"
    | "MIXPANEL_PROJECT_TOKEN"
    | "NODE_ENV"
    | "ROLLBAR_TOKEN"
    | "WEB_URL",
    string
  >,
  "CA_CERT"
>;

export type ChannelSymbol =
  | "ENTRANCE"
  | "QUESTS"
  | "ANNOUNCEMENTS"
  | "LEADERBOARD"
  | "COMMANDS"
  | "WHITELIST"
  | "FAQ"
  | "GENERAL"
  | "WELCOME_ROOM"
  | "FEEDBACK"
  | "HALL_OF_PRIVACY"
  | "TOWN_SQUARE"
  | "METRO"
  | "TAVERN"
  | "HALL_OF_ALLEIGANCE"
  | "MART"
  | "ARMORY"
  | "TOSS_HOUSE"
  | "BANK"
  | "ARENA"
  | "TRAINING_DOJO"
  | "GEN_POP"
  | `${DormitorySymbol}`;

export type Channel = {
  symbol: ChannelSymbol;
  name: string;
  lockPermissions: boolean;
  permissionOverwrites: OverwriteResolvable[];
};

export enum MartItemSymbolEnum {
  PIZZA = "PIZZA",
  NOODLES = "NOODLES",
  GRILLED_RAT = "GRILLED_RAT",
  FRACTAL_NFT = "FRACTAL_NFT",
}

export type MartItemSymbol = `${MartItemSymbolEnum}`;

export type CategorySymbol =
  | "THE_GAME"
  | "COMMAND_CENTER"
  | "COMMUNITY"
  | "BEAUTOPIA"
  | `THE_PROJECTS_${DistrictSymbol}`
  | "THE_SHELTERS"
  | "PRISON";

export type Category = {
  symbol: CategorySymbol;
  name: string;
  channels: Channel[];
  permissionOverwrites: OverwriteResolvable[];
};

export enum RoleTypeEnum {
  EVERYONE = "EVERYONE",
  BASE = "BASE",
  CITIZEN = "CITIZEN",
  SUPPLEMENTARY = "SUPPLEMENTARY",
  MANAGED = "MANAGED",
}

export enum EveryoneRoleSymbolEnum {
  EVERYONE = "EVERYONE",
}

export enum BaseRoleSymbolEnum {
  VERIFIED = "VERIFIED",
  DEGEN = "DEGEN",
  PRISONER = "PRISONER",
  ESTABLISHMENT = "ESTABLISHMENT",
}

export enum ManagedRoleSymbolEnum {
  ADMIN_BOT = "ADMIN_BOT",
  ALLY_BOT = "ALLY_BOT",
  ARMORY_CLERK_BOT = "ARMORY_CLERK_BOT",
  BANKER_BOT = "BANKER_BOT",
  BIG_BROTHER_BOT = "BIG_BROTHER_BOT",
  DEVILS_ADVOCATE_BOT = "DEVILS_ADVOCATE_BOT",
  MART_CLERK_BOT = "MART_CLERK_BOT",
  PRISONER_BOT = "PRISONER_BOT",
  RESISTANCE_LEADER_BOT = "RESISTANCE_LEADER_BOT",
  SCOUT_BOT = "SCOUT_BOT",
  SENSEI_BOT = "SENSEI_BOT",
  TOSSER_BOT = "TOSSER_BOT",
  WARDEN_BOT = "WARDEN_BOT",
}

export enum SupplementaryRoleSymbolEnum {
  ADMIN = "ADMIN",
  SERVER_BOOSTER = "SERVER_BOOSTER",
  TRAINEE = "TRAINEE",
  THOUGHT_POLICE = "THOUGHT_POLICE",
  WHITELIST = "WHITELIST",
}

export enum CitizenRoleSymbolEnum {
  D1_CITIZEN = "D1_CITIZEN",
  D2_CITIZEN = "D2_CITIZEN",
  D3_CITIZEN = "D3_CITIZEN",
  D4_CITIZEN = "D4_CITIZEN",
  D5_CITIZEN = "D5_CITIZEN",
  D6_CITIZEN = "D6_CITIZEN",
  THE_LEFT_CITIZEN = "THE_LEFT_CITIZEN",
  THE_RIGHT_CITIZEN = "THE_RIGHT_CITIZEN",
  THE_GRID_CITIZEN = "THE_GRID_CITIZEN",
  BULLSEYE_CITIZEN = "BULLSEYE_CITIZEN",
  VULTURE_CITIZEN = "VULTURE_CITIZEN",
}

export type CitizenRoleSymbol = `${CitizenRoleSymbolEnum}`;

const RoleSymbolEnum = {
  ...EveryoneRoleSymbolEnum,
  ...BaseRoleSymbolEnum,
  ...ManagedRoleSymbolEnum,
  ...SupplementaryRoleSymbolEnum,
  ...CitizenRoleSymbolEnum,
};

export { RoleSymbolEnum };

export type RoleSymbol = keyof typeof RoleSymbolEnum;

export type EveryoneRole = {
  type: "EVERYONE";
  symbol: "EVERYONE";
  permissions: string;
};

export type BaseRole = {
  type: "BASE";
  symbol: `${BaseRoleSymbolEnum}`;
  name: string;
  permissions: string;
};

export type CitizenRole = {
  type: "CITIZEN";
  symbol: `${CitizenRoleSymbolEnum}`;
  name: string;
  color: string;
};

export type ManagedRole = {
  type: "MANAGED";
  symbol: `${ManagedRoleSymbolEnum}`;
  permissions?: string;
};

export type SupplementaryRole = {
  type: "SUPPLEMENTARY";
  symbol: `${SupplementaryRoleSymbolEnum}`;
  name: string;
  permissions?: string;
};

export type Role =
  | EveryoneRole
  | BaseRole
  | CitizenRole
  | ManagedRole
  | SupplementaryRole;

type RestrictedRestrictionCheckResponse = {
  restricted: true;
  response: Parameters<BaseCommandInteraction["reply"]>[0];
};

type UnrestrictedRestrictionCheckResponse = false;

type RestrictionCheckResponse =
  | RestrictedRestrictionCheckResponse
  | UnrestrictedRestrictionCheckResponse;

export type Command = {
  symbol: string;
  permissions: APIApplicationCommandPermission[];
  restrict?: (
    i: CommandInteraction,
    channelDescriptor: ChannelDescriptor,
    user: User,
    interactee: User | null
  ) => Promise<RestrictionCheckResponse>;
  data: ReturnType<SlashCommandBuilder["toJSON"]>;
};

export type Bot = {
  symbol: NPCSymbol;
  name: string;
  commands: Command[];
  clientOptions: ClientOptions;
};

export enum ApartmentTenancyLevelEnum {
  AUTHORITY = "AUTHORITY",
  GUEST = "GUEST",
}

export type ApartmentTenancyLevel = `${ApartmentTenancyLevelEnum}`;

export enum Achievement {
  HELP_REQUESTED = "HELP_REQUESTED",
  STATS_CHECKED = "STATS_CHECKED",
  JOINED_THE_DEGENZ = "JOINED_THE_DEGENZ",
  SUPER_OBEDIENT = "SUPER_OBEDIENT",
  FINISHED_TRAINER = "FINISHED_TRAINER",
  MART_STOCK_CHECKED = "MART_STOCK_CHECKED",
  MART_ITEM_BOUGHT = "MART_ITEM_BOUGHT",
  ALLEGIANCE_PLEDGED = "ALLEGIANCE_PLEDGED",
  TOSS_COMPLETED = "TOSS_COMPLETED",
}

export enum PersistentMessageSymbolEnum {
  ENTRANCE = "ENTRANCE",
  GBT_LEADERBOARD_1 = "GBT_LEADERBOARD_1",
  GBT_LEADERBOARD_2 = "GBT_LEADERBOARD_2",
  PLEDGE = "PLEDGE",
  SHOW_QUESTS = "SHOW_QUESTS",
}

export type PersistentMessageSymbol = `${PersistentMessageSymbolEnum}`;

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

export enum ChannelTypeEnum {
  QUEST_LOG_THREAD = "QUEST_LOG_THREAD",
}

export enum QuestSymbolEnum {
  PLEDGE = "PLEDGE",
  LEARN_TO_HACKER_BATTLE = "LEARN_TO_HACKER_BATTLE",
  TOSS_WITH_TED = "TOSS_WITH_TED",
  SHOP_AT_MERRIS_MART = "SHOP_AT_MERRIS_MART",
  GET_WHITELIST = "GET_WHITELIST",
}

export type QuestSymbol = `${QuestSymbolEnum}`;

export enum EntitySymbolEnum {
  Achievement = "ACHIEVEMENT",
  ApartmentTenancy = "APARTMENT_TENANCY",
  AppState = "APP_STATE",
  CampaignInvite = "CAMPAIGN_INVITE",
  Channel = "CHANNEL",
  District = "DISTRICT",
  Dormitory = "DORMITORY",
  DormitoryTenancy = "DORMITORY_TENANCY",
  Emoji = "EMOJI",
  Imprisonment = "IMPRISONMENT",
  MartItem = "MART_ITEM",
  MartItemOwnership = "MART_ITEM_OWNERSHIP",
  NPC = "NPC",
  PersistentMessage = "PERSISTENT_MESSAGE",
  Pledge = "PLEDGE",
  QuestLogChannel = "QUEST_LOG_CHANNEL",
  QuestLogMessage = "QUEST_LOG_MESSAGE",
  Role = "ROLE",
  User = "USER",
}

export type EntitySymbol = `${EntitySymbolEnum}`;
