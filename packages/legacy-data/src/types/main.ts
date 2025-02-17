import {
  BaseCommandInteraction,
  ClientOptions,
  CommandInteraction,
  GuildMember,
  OverwriteResolvable,
  TextBasedChannel,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIApplicationCommandPermission } from "discord-api-types/v9";
import { SetOptional } from "type-fest";
import { User } from "..";

export type EnvVars = SetOptional<
  Record<
    | `${BotSymbol}_BOT_TOKEN`
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

export enum ChannelSymbolEnum {
  VERIFICATION = "VERIFICATION",
  ADMIN_GENERAL = "ADMIN_GENERAL",
  ADMIN_SANDBOX = "ADMIN_SANDBOX",

  WELCOME_ROOM = "WELCOME_ROOM",
  ORIENTATION = "ORIENTATION",

  // TODO: Delete WAITING_ROOM
  WAITING_ROOM = "WAITING_ROOM",

  ENTER_THE_PROJECTS = "ENTER_THE_PROJECTS",
  ENTER_THE_SHELTERS = "ENTER_THE_SHELTERS",

  ANNOUNCEMENTS = "ANNOUNCEMENTS",
  LEADERBOARD = "LEADERBOARD",
  COMMANDS = "COMMANDS",
  WHITELIST = "WHITELIST",
  FAQ = "FAQ",

  GENERAL = "GENERAL",
  FEEDBACK = "FEEDBACK",
  HALL_OF_PRIVACY = "HALL_OF_PRIVACY",

  TOWN_SQUARE = "TOWN_SQUARE",
  METRO = "METRO",
  TAVERN = "TAVERN",
  HALL_OF_ALLEIGANCE = "HALL_OF_ALLEIGANCE",
  MART = "MART",
  ARMORY = "ARMORY",
  TOSS_HOUSE = "TOSS_HOUSE",
  BANK = "BANK",
  ARENA = "ARENA",
  TRAINING_DOJO = "TRAINING_DOJO",

  GEN_POP = "GEN_POP",
}

export type ChannelSymbol = `${ChannelSymbolEnum}` | `${DormitorySymbolEnum}`;

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
}

export type MartItemSymbol = `${MartItemSymbolEnum}`;

export type CategorySymbol =
  | "OUTSIDE_WORLD"
  | "ADMIN"
  | "ENTRANCE"
  | "JOIN_THE_GAME"
  | "COMMAND_CENTER"
  | "COMMUNITY"
  | "BEAUTOPIA"
  | `THE_${DistrictSymbol}`
  | "THE_SHELTERS"
  | "PRISON";

export type Category = {
  symbol: CategorySymbol;
  name: string;
  channels: Channel[];
  permissionOverwrites: OverwriteResolvable[];
};

export enum BotSymbolEnum {
  ADMIN = "ADMIN",
  ALLY = "ALLY",
  ARMORY_CLERK = "ARMORY_CLERK",
  BANKER = "BANKER",
  BIG_BROTHER = "BIG_BROTHER",
  DEVILS_ADVOCATE = "DEVILS_ADVOCATE",
  MART_CLERK = "MART_CLERK",
  PRISONER = "PRISONER",
  SCOUT = "SCOUT",
  SENSEI = "SENSEI",
  TOSSER = "TOSSER",
  WARDEN = "WARDEN",
  RESISTANCE_LEADER = "RESISTANCE_LEADER",
}

export enum RoleTypeEnum {
  BASE = "BASE",
  CITIZEN = "CITIZEN",
  SUPPLEMENTARY = "SUPPLEMENTARY",
  MANAGED = "MANAGED",
}

export type BotSymbol = `${BotSymbolEnum}`;

export type RoleSymbol =
  | "ADMIN"
  | "DEGEN"
  | "EVERYONE"
  | "PRISONER"
  | "SERVER_BOOSTER"
  | "VERIFIED"
  | "TRAINEE"
  | "HIGH_COMMAND"
  | `${BotSymbol}_BOT`
  | "THOUGHT_POLICE";

type D = "D1" | "D2" | "D3" | "D4" | "D5" | "D6";
export type CitizenRoleSymbol = `${D}_CITIZEN` | `${DormitorySymbol}_CITIZEN`;

export type SupplementaryRoleSymbol = "THOUGHT_POLICE";

export enum RoleSymbolEnum {
  ADMIN = "ADMIN",
  DEGEN = "DEGEN",
  EVERYONE = "EVERYONE",
  PRISONER = "PRISONER",
  SERVER_BOOSTER = "SERVER_BOOSTER",
  VERIFIED = "VERIFIED",
  TRAINEE = "TRAINEE",
  ADMIN_BOT = "ADMIN_BOT",
  ALLY_BOT = "ALLY_BOT",
  ARMORY_CLERK_BOT = "ARMORY_CLERK_BOT",
  BANKER_BOT = "BANKER_BOT",
  BIG_BROTHER_BOT = "BIG_BROTHER_BOT",
  DEVILS_ADVOCATE_BOT = "DEVILS_ADVOCATE_BOT",
  MART_CLERK_BOT = "MART_CLERK_BOT",
  PRISONER_BOT = "PRISONER_BOT",
  SCOUT_BOT = "SCOUT_BOT",
  SENSEI_BOT = "SENSEI_BOT",
  TOSSER_BOT = "TOSSER_BOT",
  WARDEN_BOT = "WARDEN_BOT",
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
  THOUGHT_POLICE = "THOUGHT_POLICE",
}

export type BaseRole = {
  type: "BASE";
  symbol: RoleSymbol;
  name: string;
  permissions: string;
};

export type CitizenRole = {
  type: "CITIZEN";
  symbol: CitizenRoleSymbol;
  name: string;
  color: string;
};

export type ManagedRole = {
  type: "MANAGED";
  symbol: RoleSymbol;
};

export type SupplementaryRole = {
  type: "SUPPLEMENTARY";
  symbol: SupplementaryRoleSymbol;
  name: string;
};

export type Role = BaseRole | CitizenRole | ManagedRole | SupplementaryRole;

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
  symbol: BotSymbol;
  name: string;
  commands: Command[];
  clientOptions: ClientOptions;
};

export enum ApartmentTenancyLevelEnum {
  AUTHORITY = "AUTHORITY",
  GUEST = "GUEST",
}

export type ApartmentTenancyLevel = `${ApartmentTenancyLevelEnum}`;

export enum DistrictSymbol {
  PROJECTS_D1 = "PROJECTS_D1",
  PROJECTS_D2 = "PROJECTS_D2",
  PROJECTS_D3 = "PROJECTS_D3",
  PROJECTS_D4 = "PROJECTS_D4",
  PROJECTS_D5 = "PROJECTS_D5",
  PROJECTS_D6 = "PROJECTS_D6",
}

export enum DormitorySymbolEnum {
  THE_LEFT = "THE_LEFT",
  THE_RIGHT = "THE_RIGHT",
  THE_GRID = "THE_GRID",
  BULLSEYE = "BULLSEYE",
  VULTURE = "VULTURE",
}

export type DormitorySymbol = `${DormitorySymbolEnum}`;

export enum Achievement {
  HELP_REQUESTED = "HELP_REQUESTED",
  STATS_CHECKED = "STATS_CHECKED",
  JOINED_THE_DEGENZ = "JOINED_THE_DEGENZ",
  SUPER_OBEDIENT = "SUPER_OBEDIENT",
  FINISHED_TRAINER = "FINISHED_TRAINER",
  MART_STOCK_CHECKED = "MART_STOCK_CHECKED",
  MART_ITEM_BOUGHT = "MART_ITEM_BOUGHT",
}

export enum PersistentMessageSymbolEnum {
  // TODO: Delete ENTRY
  ENTRY = "ENTRY",
  GBT_LEADERBOARD_1 = "GBT_LEADERBOARD_1",
  GBT_LEADERBOARD_2 = "GBT_LEADERBOARD_2",
  PLEDGE = "PLEDGE",
  THE_PROJECTS_ENTRY = "THE_PROJECTS_ENTRY",
  THE_SHELTERS_ENTRY = "THE_SHELTERS_ENTRY",
  VERIFY = "VERIFY",
  WELCOME_INFO = "WELCOME_INFO",
  WELCOME_NOTIFICATION = "WELCOME_NOTIFICATION",
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
  channel: TextBasedChannel;
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
  isVerification: boolean;
  isGenPop: boolean;
  isBank: boolean;
  isTavern: boolean;
};
