import {
  BotSymbol,
  CategorySymbol,
  ChannelSymbol,
  RoleSymbol,
} from "data/types";

const GENERAL = {
  DISTRICT_CAPACITY: 2,
  GUILD_ID: "",
  SKIP_DELAY: false,
  WORLD_NAME: "Beautopia",
};

const CATEGORY_IDS: Record<CategorySymbol, string> = {
  OUTSIDE_WORLD: "",
  ADMIN: "",
  ENTRANCE: "",
  COMMAND_CENTER: "",
  COMMUNITY: "",
  BEAUTOPIA: "",
  THE_PROJECTS_D1: "",
  THE_PROJECTS_D2: "",
  THE_PROJECTS_D3: "",
  THE_PROJECTS_D4: "",
  THE_PROJECTS_D5: "",
  THE_PROJECTS_D6: "",
  PRISON: "",
};

const CHANNEL_IDS: Record<ChannelSymbol, string> = {
  VERIFICATION: "",
  ADMIN_GENERAL: "",
  ADMIN_SANDBOX: "",
  WELCOME_ROOM: "",
  WAITING_ROOM: "",
  ANNOUNCEMENTS: "",
  LEADERBOARD: "",
  COMMANDS: "",
  FAQ: "",
  GENERAL: "",
  FEEDBACK: "",
  HALL_OF_PRIVACY: "",
  TOWN_SQUARE: "",
  METRO: "",
  TAVERN: "",
  HALL_OF_ALLEIGANCE: "",
  MART: "",
  ARMORY: "",
  TOSS_HOUSE: "",
  BANK: "",
  ARENA: "",
  TRAINING_DOJO: "",
  GEN_POP: "",
};

const ROLE_IDS: Record<RoleSymbol, string> = {
  ADMIN: "",
  ADMIN_BOT: "",
  ALLY_BOT: "",
  ARMORY_CLERK_BOT: "",
  BANKER_BOT: "",
  BIG_BROTHER_BOT: "",
  DEGEN: "",
  DEVILS_ADVOCATE_BOT: "",
  EVERYONE: GENERAL.GUILD_ID,
  MART_CLERK_BOT: "",
  PRISONER: "",
  PRISONER_BOT: "",
  SENSEI_BOT: "",
  SERVER_BOOSTER: "",
  TOSSER_BOT: "",
  TRAINEE: "",
  VERIFIED: "",
  WARDEN_BOT: "",
};

const CLIENT_IDS: Record<BotSymbol, string> = {
  ADMIN: "",
  ALLY: "",
  ARMORY_CLERK: "",
  BANKER: "",
  BIG_BROTHER: "",
  DEVILS_ADVOCATE: "",
  MART_CLERK: "",
  PRISONER: "",
  SENSEI: "",
  TOSSER: "",
  WARDEN: "",
};

export default {
  CATEGORY_IDS,
  CHANNEL_IDS,
  CLIENT_IDS,
  GENERAL,
  ROLE_IDS,
};
