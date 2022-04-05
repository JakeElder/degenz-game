import { BotSymbol, CategorySymbol, ChannelSymbol } from "data/types";

const GENERAL = {
  DISTRICT_CAPACITY: 2,
  GUILD_ID: "931833263289401444",
  PROD_GUILD_ID: "933888229776703559",
  READ_ONLY: false,
  SKIP_DELAY: false,
  USE_SCOUT: false,
  WORLD_NAME: "Beautopia",
};

const CATEGORY_IDS: Record<CategorySymbol, string> = {
  BEAUTOPIA: "948179271917109268",
  COMMAND_CENTER: "948179256507252756",
  COMMUNITY: "948179265134948372",
  PRISON: "948179314988433438",
  THE_GAME: "948179244830298112",
  THE_PROJECTS_D1: "948179304523653120",
  THE_PROJECTS_D2: "948179306792763392",
  THE_PROJECTS_D3: "948179308373999630",
  THE_PROJECTS_D4: "948179309925892107",
  THE_PROJECTS_D5: "948179311540707328",
  THE_PROJECTS_D6: "948179313113587733",
  THE_SHELTERS: "953618393129422858",
};

const CHANNEL_IDS: Record<ChannelSymbol, string> = {
  ANNOUNCEMENTS: "948179258092707860",
  ARENA: "948179297754054676",
  ARMORY: "948179287834517544",
  BANK: "948179294700589086",
  BULLSEYE: "953618550277419008",
  COMMANDS: "948179261502677073",
  ENTRANCE: "-",
  FAQ: "948179263369146408",
  FEEDBACK: "948179268456816680",
  GENERAL: "948179266707812372",
  GEN_POP: "948179316980727819",
  HALL_OF_ALLEIGANCE: "948179281111027732",
  HALL_OF_PRIVACY: "948179270084222996",
  LEADERBOARD: "948179259778822154",
  MART: "948179284479070238",
  METRO: "948179275696189480",
  QUESTS: "-",
  TAVERN: "948179279257174017",
  THE_GRID: "953618612667699230",
  THE_LEFT: "953618662852558878",
  THE_RIGHT: "953618702761357323",
  TOSS_HOUSE: "948179291001225236",
  TOWN_SQUARE: "948179273582252072",
  TRAINING_DOJO: "948179301071720528",
  VULTURE: "953618764795113512",
  WELCOME_ROOM: "948179248911384636",
  WHITELIST: "955685916716978196",
};

const CLIENT_IDS: Record<BotSymbol, string> = {
  RESISTANCE_LEADER: "-",
  ADMIN: "936928889018658867",
  ALLY: "936929472643473418",
  ARMORY_CLERK: "936930134601129984",
  BANKER: "936929314727936030",
  BIG_BROTHER: "936928667815280740",
  DEVILS_ADVOCATE: "-",
  MART_CLERK: "936930134601129984",
  PRISONER: "936929698615816202",
  SCOUT: "-",
  SENSEI: "937151182504362055",
  TOSSER: "936929124088447026",
  WARDEN: "936929885421715526",
};

export default {
  CATEGORY_IDS,
  CHANNEL_IDS,
  CLIENT_IDS,
  GENERAL,
};
