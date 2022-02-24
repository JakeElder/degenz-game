import { BotSymbol, CategorySymbol, ChannelSymbol, RoleSymbol } from "types";

const GENERAL = {
  DISTRICT_CAPACITY: 1,
  GUILD_ID: "936810600766525501",
  LEADERBOARD_MESSAGE_ID: "938248609286197279",
  SKIP_DELAY: true,
  VERIFICATION_MESSAGE_ID: "938270231405686834",
  WORLD_NAME: "Beautopia",
};

const CATEGORY_IDS: Record<CategorySymbol, string> = {
  ADMIN: "942946332480512010",
  BEAUTOPIA: "942946354081194015",
  COMMUNITY: "942946337882791947",
  OUTSIDE_WORLD: "942946328571437096",
  PRISON: "942946391687299122",
  THE_PROJECTS_D1: "942946380798918746",
  THE_PROJECTS_D2: "942946382409531413",
  THE_PROJECTS_D3: "942946383936225370",
  THE_PROJECTS_D4: "942946385685270539",
  THE_PROJECTS_D5: "942946387799199755",
  THE_PROJECTS_D6: "942946389875372062",
};

const CHANNEL_IDS: Record<ChannelSymbol, string> = {
  ADMIN_GENERAL: "942946334158229584",
  ADMIN_SANDBOX: "942946336087617536",
  ANNOUNCEMENTS: "942946344857923604",
  ARENA: "942946373748260874",
  ARMORY: "942946360859172894",
  BANK: "942946368647999488",
  COMMANDS: "942946352327975014",
  FAQ: "942946350503436368",
  FEEDBACK: "942946343134052393",
  GENERAL: "942946339547914281",
  GEN_POP: "942946393344057354",
  HALL_OF_ALLEIGANCE: "945164739837837373",
  HALL_OF_PRIVACY: "942946348683132998",
  LEADERBOARD: "942946346753720392",
  MART: "942946357294030940",
  TOSS_HOUSE: "942946364667609118",
  TOWN_SQUARE: "942946355901517854",
  TRAINING_DOJO: "942946377334394960",
  VERIFICATION: "942946330727284738",
  WAITING_ROOM: "942946341393420288",
  WELCOME_ROOM: "944935777744351323",
};

const ROLE_IDS: Record<RoleSymbol, string> = {
  ADMIN: "936810600766525505",
  ADMIN_BOT: "936884042358489109",
  ALLY_BOT: "936887535928479747",
  ARMORY_CLERK_BOT: "937942341581430855",
  BANKER_BOT: "936836474853269535",
  BIG_BROTHER_BOT: "936836062024716329",
  DEGEN: "936810600766525503",
  EVERYONE: "936810600766525501",
  MART_CLERK_BOT: "936885393977122846",
  PRISONER_BOT: "936836865888223233",
  PRISONER: "936810600766525504",
  SENSEI_BOT: "937943617589370911",
  SERVER_BOOSTER: "-",
  TOSSER_BOT: "936836179788173402",
  VERIFIED: "936810600766525502",
  WARDEN_BOT: "936837108574851153",
};

const CLIENT_IDS: Record<BotSymbol, string> = {
  ADMIN: "936833419063738428",
  ALLY: "936833286695686154",
  ARMORY_CLERK: "937941828068577360",
  BANKER: "936832865939882026",
  BIG_BROTHER: "936832574972633140",
  MART_CLERK: "936833477310042142",
  PRISONER: "936833059267940424",
  SENSEI: "937943222821453844",
  TOSSER: "936832745521438882",
  WARDEN: "936833165849428059",
};

export default {
  CATEGORY_IDS,
  CHANNEL_IDS,
  CLIENT_IDS,
  GENERAL,
  ROLE_IDS,
};
