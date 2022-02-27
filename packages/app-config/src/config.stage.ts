import {
  BotSymbol,
  CategorySymbol,
  ChannelSymbol,
  RoleSymbol,
} from "data/types";

const GENERAL = {
  DISTRICT_CAPACITY: 2,
  GUILD_ID: "931833263289401444",
  SKIP_DELAY: false,
  WORLD_NAME: "Beautopia",
};

const CATEGORY_IDS: Record<CategorySymbol, string> = {
  ADMIN: "945898335657672754",
  BEAUTOPIA: "945898377395204166",
  COMMUNITY: "945898342792175627",
  OUTSIDE_WORLD: "945898332465811506",
  PRISON: "945898434332880996",
  THE_PROJECTS_D1: "945898412820287528",
  THE_PROJECTS_D2: "945898414347014184",
  THE_PROJECTS_D3: "945898420151910400",
  THE_PROJECTS_D4: "945898422093885510",
  THE_PROJECTS_D5: "945898423859695636",
  THE_PROJECTS_D6: "945898426309148783",
};

const CHANNEL_IDS: Record<ChannelSymbol, string> = {
  ADMIN_GENERAL: "945898337482178561",
  ADMIN_SANDBOX: "945898340254646395",
  ANNOUNCEMENTS: "945898367421136896",
  ARENA: "945898405673205871",
  ARMORY: "945898394969317386",
  BANK: "945898402070265886",
  COMMANDS: "945898375704899604",
  FAQ: "945898373834244147",
  FEEDBACK: "945898365756002374",
  GENERAL: "945898359774928907",
  GEN_POP: "945898437717684284",
  HALL_OF_ALLEIGANCE: "945898384005431296",
  HALL_OF_PRIVACY: "945898371292487760",
  LEADERBOARD: "945898369115627550",
  MART: "945898390552727582",
  SNEAK_PEEKS: "-",
  TOSS_HOUSE: "945898398698057748",
  TOWN_SQUARE: "945898379165184020",
  TRAINING_DOJO: "945898409582276629",
  VERIFICATION: "945898334105784330",
  WAITING_ROOM: "945898362056605757",
  WELCOME_ROOM: "945898354309726319",
};

const ROLE_IDS: Record<RoleSymbol, string> = {
  ADMIN: "939381157299097620",
  ADMIN_BOT: "939339304411463701",
  ALLY_BOT: "939376736880169011",
  ARMORY_CLERK_BOT: "939377675250831371",
  BANKER_BOT: "939376539785642005",
  BIG_BROTHER_BOT: "939375846010011689",
  DEGEN: "931870362755559465",
  DEVILS_ADVOCATE_BOT: "-",
  EVERYONE: "931833263289401444",
  MART_CLERK_BOT: "939377472615628841",
  PRISONER: "939379359846891541",
  PRISONER_BOT: "939377016946458655",
  SENSEI_BOT: "944588302818877535",
  SERVER_BOOSTER: "-",
  TOSSER_BOT: "939376191037661225",
  VERIFIED: "933344031856013373",
  WARDEN_BOT: "939377266176180266",
};

const CLIENT_IDS: Record<BotSymbol, string> = {
  ADMIN: "936928889018658867",
  ALLY: "936929472643473418",
  ARMORY_CLERK: "936930134601129984",
  BANKER: "936929314727936030",
  BIG_BROTHER: "936928667815280740",
  DEVILS_ADVOCATE: "-",
  MART_CLERK: "936930134601129984",
  PRISONER: "936929698615816202",
  SENSEI: "937151182504362055",
  TOSSER: "936929124088447026",
  WARDEN: "936929885421715526",
};

export default {
  CATEGORY_IDS,
  CHANNEL_IDS,
  CLIENT_IDS,
  GENERAL,
  ROLE_IDS,
};
