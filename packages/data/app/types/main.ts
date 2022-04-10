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
  ENTRANCE = "ENTRANCE",
  QUESTS = "QUESTS",

  ANNOUNCEMENTS = "ANNOUNCEMENTS",
  LEADERBOARD = "LEADERBOARD",
  COMMANDS = "COMMANDS",
  WHITELIST = "WHITELIST",
  FAQ = "FAQ",

  GENERAL = "GENERAL",
  WELCOME_ROOM = "WELCOME_ROOM",
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
  | "THE_GAME"
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
  EVERYONE = "EVERYONE",
  BASE = "BASE",
  CITIZEN = "CITIZEN",
  SUPPLEMENTARY = "SUPPLEMENTARY",
  MANAGED = "MANAGED",
}

export type BotSymbol = `${BotSymbolEnum}`;

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

export enum EmojiSymbolEnum {
  ALLY_NPC = "ALLY_NPC",
  ANON = "ANON",
  ARMORY_CLERK_NPC = "ARMORY_CLERK_NPC",
  BABY = "BABY",
  BANKER_NPC = "BANKER_NPC",
  BB = "BB",
  BIG_BROTHER_NPC = "BIG_BROTHER_NPC",
  BLUE_TICK = "BLUE_TICK",
  BULLSEYE = "BULLSEYE",
  BULLSEYE_INACTIVE = "BULLSEYE_INACTIVE",
  CHICKEN = "CHICKEN",
  CIRCUIT_BOARD = "CIRCUIT_BOARD",
  COIN_HEADS = "COIN_HEADS",
  COIN_TAILS = "COIN_TAILS",
  CROWN = "CROWN",
  CUPCAKE = "CUPCAKE",
  CYPHER_SHIELD = "CYPHER_SHIELD",
  D1 = "D1",
  D2 = "D2",
  D3 = "D3",
  D4 = "D4",
  D5 = "D5",
  D6 = "D6",
  DEGENZ_RAMEN = "DEGENZ_RAMEN",
  DEVILS_ADVOCATE_NPC = "DEVILS_ADVOCATE_NPC",
  DOWN_ARROW = "DOWN_ARROW",
  ENCRYPTION_SHIELD = "ENCRYPTION_SHIELD",
  EYE = "EYE",
  FAT_PIZZA = "FAT_PIZZA",
  FIREWALL_SHIELD = "FIREWALL_SHIELD",
  GBT_COIN = "GBT_COIN",
  KEY = "KEY",
  MART_CLERK_NPC = "MART_CLERK_NPC",
  MOONSHINE = "MOONSHINE",
  NUU_PING = "NUU_PING",
  OBEY = "OBEY",
  OLD_TV = "OLD_TV",
  PILL_BOTTLE = "PILL_BOTTLE",
  PRISONER_NPC = "PRISONER_NPC",
  RAT = "RAT",
  RED_BLUE_PILLS = "RED_BLUE_PILLS",
  RED_DICE = "RED_DICE",
  RED_TICK = "RED_TICK",
  REMOTE_ACCESS = "REMOTE_ACCESS",
  RESISTANCE_LEADER_NPC = "RESISTANCE_LEADER_NPC",
  SENSEI_NPC = "SENSEI_NPC",
  SUNSHINE = "SUNSHINE",
  SUSHI = "SUSHI",
  THE_GRID = "THE_GRID",
  THE_GRID_INACTIVE = "THE_GRID_INACTIVE",
  THE_LEFT = "THE_LEFT",
  THE_LEFT_INACTIVE = "THE_LEFT_INACTIVE",
  THE_RIGHT = "THE_RIGHT",
  THE_RIGHT_INACTIVE = "THE_RIGHT_INACTIVE",
  THOUGHT_POLICE = "THOUGHT_POLICE",
  TIGER_BLOOD = "TIGER_BLOOD",
  TOSSER_NPC = "TOSSER_NPC",
  UP_ARROW = "UP_ARROW",
  VIRUS_HACK = "VIRUS_HACK",
  VULTURE = "VULTURE",
  VULTURE_INACTIVE = "VULTURE_INACTIVE",
  WARDEN_NPC = "WARDEN_NPC",
  WORM_HACK = "WORM_HACK",
}

export type EmojiSymbol = `${EmojiSymbolEnum}`;

export type Emoji = {
  symbol: EmojiSymbol;
  name: string;
};
