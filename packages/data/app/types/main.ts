import { ClientOptions, GuildMember, OverwriteResolvable } from "discord.js";
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
  WAITING_ROOM = "WAITING_ROOM",

  ANNOUNCEMENTS = "ANNOUNCEMENTS",
  LEADERBOARD = "LEADERBOARD",
  COMMANDS = "COMMANDS",
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

export type ChannelSymbol = `${ChannelSymbolEnum}`;

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
  | "COMMAND_CENTER"
  | "COMMUNITY"
  | "BEAUTOPIA"
  | `THE_${DistrictSymbol}`
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
  SENSEI = "SENSEI",
  TOSSER = "TOSSER",
  WARDEN = "WARDEN",
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
  | `${BotSymbol}_BOT`;

export type Role = {
  symbol: RoleSymbol;
  name?: string;
  managed?: boolean;
  permissions?: string;
};

export type Command = {
  symbol: string;
  permissions: APIApplicationCommandPermission[];
  data: ReturnType<SlashCommandBuilder["toJSON"]>;
};

export type Bot = {
  symbol: BotSymbol;
  name: string;
  commands: Command[];
  clientOptions: ClientOptions;
};

export enum TenancyType {
  AUTHORITY = "AUTHORITY",
  GUEST = "GUEST",
}

export enum DistrictSymbol {
  PROJECTS_D1 = "PROJECTS_D1",
  PROJECTS_D2 = "PROJECTS_D2",
  PROJECTS_D3 = "PROJECTS_D3",
  PROJECTS_D4 = "PROJECTS_D4",
  PROJECTS_D5 = "PROJECTS_D5",
  PROJECTS_D6 = "PROJECTS_D6",
}

export enum ShelterSymbol {
  SHELTER_D1 = "SHELTER_D1",
  SHELTER_D2 = "SHELTER_D2",
  SHELTER_D3 = "SHELTER_D3",
  SHELTER_D4 = "SHELTER_D4",
  SHELTER_D5 = "SHELTER_D5",
  SHELTER_D6 = "SHELTER_D6",
  SHELTER_D7 = "SHELTER_D7",
  SHELTER_D8 = "SHELTER_D8",
  SHELTER_D9 = "SHELTER_D9",
  SHELTER_D10 = "SHELTER_D10",
}

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
  WELCOME_INFO = "WELCOME_INFO",
  WELCOME_NOTIFICATION = "WELCOME_NOTIFICATION",
  GBT_LEADERBOARD_1 = "GBT_LEADERBOARD_1",
  GBT_LEADERBOARD_2 = "GBT_LEADERBOARD_2",
  ENTRY = "ENTRY",
  VERIFY = "VERIFY",
  PLEDGE = "PLEDGE",
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
