import { ClientOptions, GuildMember, OverwriteResolvable } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIApplicationCommandPermission } from "discord-api-types/v9";
import { SetOptional } from "type-fest";
import { User } from "..";

export type EnvVars = SetOptional<
  Record<
    | "ADMIN_BOT_TOKEN"
    | "ALLY_BOT_TOKEN"
    | "ARMORY_CLERK_BOT_TOKEN"
    | "BANKER_BOT_TOKEN"
    | "BIG_BROTHER_BOT_TOKEN"
    | "DATABASE_URL"
    | "MART_CLERK_BOT_TOKEN"
    | "MIXPANEL_PROJECT_TOKEN"
    | "MONGO_URI"
    | "NODE_ENV"
    | "PRISONER_BOT_TOKEN"
    | "ROLLBAR_TOKEN"
    | "SENSEI_BOT_TOKEN"
    | "TOSSER_BOT_TOKEN"
    | "CA_CERT"
    | "WARDEN_BOT_TOKEN",
    string
  >,
  "CA_CERT"
>;

export type ChannelSymbol =
  | "VERIFICATION"
  | "ADMIN_GENERAL"
  | "ADMIN_SANDBOX"
  | "WELCOME_ROOM"
  | "GENERAL"
  | "WAITING_ROOM"
  | "SNEAK_PEEKS"
  | "FEEDBACK"
  | "ANNOUNCEMENTS"
  | "LEADERBOARD"
  | "HALL_OF_PRIVACY"
  | "FAQ"
  | "COMMANDS"
  | "TOWN_SQUARE"
  | "HALL_OF_ALLEIGANCE"
  | "MART"
  | "TOSS_HOUSE"
  | "BANK"
  | "ARENA"
  | "ARMORY"
  | "TRAINING_DOJO"
  | "GEN_POP";

export type Channel = {
  symbol: ChannelSymbol;
  name: string;
  lockPermissions: boolean;
  permissionOverwrites: OverwriteResolvable[];
};

export type CategorySymbol =
  | "OUTSIDE_WORLD"
  | "ADMIN"
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

export type BotSymbol =
  | "ADMIN"
  | "ALLY"
  | "ARMORY_CLERK"
  | "BANKER"
  | "BIG_BROTHER"
  | "MART_CLERK"
  | "PRISONER"
  | "SENSEI"
  | "TOSSER"
  | "WARDEN";

export type RoleSymbol =
  | "ADMIN"
  | "DEGEN"
  | "EVERYONE"
  | "PRISONER"
  | "SERVER_BOOSTER"
  | "VERIFIED"
  | `${BotSymbol}_BOT`;

export type Role = {
  symbol: RoleSymbol;
  app?: boolean;
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
