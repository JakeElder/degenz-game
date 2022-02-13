import { ClientOptions, OverwriteResolvable } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIApplicationCommandPermission } from "discord-api-types/v9";

export type EnvVars = Record<
  | "ADMIN_BOT_TOKEN"
  | "ALLY_BOT_TOKEN"
  | "ARMORY_CLERK_BOT_TOKEN"
  | "BANKER_BOT_TOKEN"
  | "BIG_BROTHER_BOT_TOKEN"
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
  | "THE_PROJECTS_D1"
  | "THE_PROJECTS_D2"
  | "THE_PROJECTS_D3"
  | "THE_PROJECTS_D4"
  | "THE_PROJECTS_D5"
  | "THE_PROJECTS_D6"
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
