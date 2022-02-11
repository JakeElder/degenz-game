import { OverwriteResolvable } from "discord.js";

export type EnvVars = Record<
  | "ADMIN_BOT_TOKEN"
  | "ALLY_BOT_TOKEN"
  | "BANKER_BOT_TOKEN"
  | "BIG_BROTHER_TOKEN"
  | "MART_CLERK_BOT_TOKEN"
  | "MONGO_URI"
  | "NODE_ENV"
  | "MIXPANEL_PROJECT_TOKEN"
  | "PRISONER_BOT_TOKEN"
  | "TOSSER_BOT_TOKEN"
  | "WARDEN_BOT_TOKEN"
  | "ROLLBAR_TOKEN",
  string
>;

export type Channel = {
  id: string;
  name: string;
  lockPermissions: boolean;
  permissionOverwrites: OverwriteResolvable[];
};

export type Category = {
  id: string;
  name: string;
  channels: Channel[];
  permissionOverwrites: OverwriteResolvable[];
};
