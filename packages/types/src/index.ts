import { ClientOptions, OverwriteResolvable } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIApplicationCommandPermission } from "discord-api-types/v9";

export type EnvVars = Record<
  | "ADMIN_BOT_TOKEN"
  | "ALLY_BOT_TOKEN"
  | "ARMORY_CLERK_BOT_TOKEN"
  | "BANKER_BOT_TOKEN"
  | "BIG_BROTHER_BOT_TOKEN"
  | "DB_CONN_STRING"
  | "MART_CLERK_BOT_TOKEN"
  | "MIXPANEL_PROJECT_TOKEN"
  | "MONGO_URI"
  | "NODE_ENV"
  | "PRISONER_BOT_TOKEN"
  | "ROLLBAR_TOKEN"
  | "SENSEI_BOT_TOKEN"
  | "TOSSER_BOT_TOKEN"
  | "WARDEN_BOT_TOKEN",
  string
>;

export type ChannelId =
  | "VERIFICATION"
  | "ADMIN_GENERAL"
  | "ADMIN_SANDBOX"
  | "GENERAL"
  | "WAITING_ROOM"
  | "FEEDBACK"
  | "ANNOUNCEMENTS"
  | "LEADERBOARD"
  | "HALL_OF_PRIVACY"
  | "FAQ"
  | "COMMANDS"
  | "TOWN_SQUARE"
  | "MART"
  | "TOSS_HOUSE"
  | "BANK"
  | "ARENA"
  | "ARMORY"
  | "TRAINING_DOJO"
  | "GEN_POP";

export type Channel = {
  id: ChannelId;
  name: string;
  lockPermissions: boolean;
  permissionOverwrites: OverwriteResolvable[];
};

export type CategoryId =
  | "OUTSIDE_WORLD"
  | "ADMIN"
  | "COMMUNITY"
  | "BEAUTOPIA"
  | `THE_${DistrictId}`
  | "PRISON";

export type Category = {
  id: CategoryId;
  name: string;
  channels: Channel[];
  permissionOverwrites: OverwriteResolvable[];
};

export type BotId =
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

export type RoleId =
  | "ADMIN"
  | "DEGEN"
  | "EVERYONE"
  | "PRISONER"
  | "SERVER_BOOSTER"
  | "VERIFIED"
  | `${BotId}_BOT`;

export type Role = {
  id: RoleId;
  app?: boolean;
};

export type Command = {
  id: string;
  permissions: APIApplicationCommandPermission[];
  data: ReturnType<SlashCommandBuilder["toJSON"]>;
};

export type Bot = {
  id: BotId;
  name: string;
  commands: Command[];
  clientOptions: ClientOptions;
};

export enum TenancyType {
  AUTHORITY = "AUTHORITY",
  GUEST = "GUEST",
}

export enum DistrictId {
  PROJECTS_D1 = "PROJECTS_D1",
  PROJECTS_D2 = "PROJECTS_D2",
  PROJECTS_D3 = "PROJECTS_D3",
  PROJECTS_D4 = "PROJECTS_D4",
  PROJECTS_D5 = "PROJECTS_D5",
  PROJECTS_D6 = "PROJECTS_D6",
}

export enum ShelterId {
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
}
