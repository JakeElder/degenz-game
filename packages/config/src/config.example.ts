import { BotSymbol, CategorySymbol, ChannelSymbol } from "data/types";

const GENERAL = {
  DISTRICT_CAPACITY: 2,
  GUILD_ID: "",
  PROD_GUILD_ID: "",
  READ_ONLY: false,
  SKIP_DELAY: false,
  USE_SCOUT: false,
  WORLD_NAME: "Beautopia",
};

const CATEGORY_IDS: Record<CategorySymbol, string> = {
  BEAUTOPIA: "",
  COMMAND_CENTER: "",
  COMMUNITY: "",
  PRISON: "",
  THE_GAME: "",
  THE_PROJECTS_D1: "",
  THE_PROJECTS_D2: "",
  THE_PROJECTS_D3: "",
  THE_PROJECTS_D4: "",
  THE_PROJECTS_D5: "",
  THE_PROJECTS_D6: "",
  THE_SHELTERS: "",
};

const CHANNEL_IDS: Record<ChannelSymbol, string> = {
  ANNOUNCEMENTS: "",
  ARENA: "",
  ARMORY: "",
  BANK: "",
  BULLSEYE: "",
  COMMANDS: "",
  ENTRANCE: "",
  FAQ: "",
  FEEDBACK: "",
  GENERAL: "",
  GEN_POP: "",
  HALL_OF_ALLEIGANCE: "",
  HALL_OF_PRIVACY: "",
  LEADERBOARD: "",
  MART: "",
  METRO: "",
  QUESTS: "",
  TAVERN: "",
  THE_GRID: "",
  THE_LEFT: "",
  THE_RIGHT: "",
  TOSS_HOUSE: "",
  TOWN_SQUARE: "",
  TRAINING_DOJO: "",
  VULTURE: "",
  WELCOME_ROOM: "",
  WHITELIST: "",
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
  RESISTANCE_LEADER: "",
  SCOUT: "",
  SENSEI: "",
  TOSSER: "",
  WARDEN: "",
};

export default {
  CATEGORY_IDS,
  CHANNEL_IDS,
  CLIENT_IDS,
  GENERAL,
};
