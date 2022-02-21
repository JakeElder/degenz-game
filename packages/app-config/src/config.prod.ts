import { BotSymbol, CategorySymbol, ChannelSymbol, RoleSymbol } from "types";

const GENERAL = {
  DISTRICT_CAPACITY: 50,
  GUILD_ID: "933888229776703559",
  LEADERBOARD_MESSAGE_ID: "935854598181228545",
  SKIP_DELAY: false,
  VERIFICATION_MESSAGE_ID: "933958426898337802",
  WORLD_NAME: "Beautopia",
};

const CATEGORY_IDS: Record<CategorySymbol, string> = {
  ADMIN: "933890294431248454",
  BEAUTOPIA: "933888617632391199",
  COMMUNITY: "933888430293803068",
  OUTSIDE_WORLD: "933893983627776061",
  PRISON: "933888711551254588",
  THE_PROJECTS_D1: "935347742081974332",
  THE_PROJECTS_D2: "940477768653754409",
  THE_PROJECTS_D3: "940477769924620319",
  THE_PROJECTS_D4: "940477771895939122",
  THE_PROJECTS_D5: "940477773770805298",
  THE_PROJECTS_D6: "940477775461113916",
};

const CHANNEL_IDS: Record<ChannelSymbol, string> = {
  ADMIN_GENERAL: "933890335573176370",
  ADMIN_SANDBOX: "933919605322305558",
  ANNOUNCEMENTS: "935375691887829042",
  ARENA: "933889934509604874",
  ARMORY: "933890100432076841",
  BANK: "933889030351904818",
  COMMANDS: "938019946573742110",
  FAQ: "937563312957317131",
  FEEDBACK: "935375658928971807",
  GENERAL: "-",
  GEN_POP: "933888816702447616",
  HALL_OF_ALLEIGANCE: "-",
  HALL_OF_PRIVACY: "933891153680551976",
  LEADERBOARD: "935852579081060402",
  MART: "934798922617081866",
  TOSS_HOUSE: "933888966732697600",
  TOWN_SQUARE: "933888899686727730",
  TRAINING_DOJO: "935094852868251648",
  VERIFICATION: "933894136279486484",
  WAITING_ROOM: "933891067336597504",
  WELCOME_ROOM: "-",
};

const ROLE_IDS: Record<RoleSymbol, string> = {
  ADMIN: "933891976871440415",
  ADMIN_BOT: "934107780766384169",
  ALLY_BOT: "933917241148317748",
  ARMORY_CLERK_BOT: "937607880104886313",
  BANKER_BOT: "935937316231471205",
  BIG_BROTHER_BOT: "934712865590497311",
  DEGEN: "933891425710534707",
  EVERYONE: "933888229776703559",
  MART_CLERK_BOT: "934798696493756487",
  PRISONER: "933892191527526431",
  PRISONER_BOT: "935508906812264469",
  SENSEI_BOT: "937686068008984589",
  SERVER_BOOSTER: "935907794941522011",
  TOSSER_BOT: "935937038002319390",
  VERIFIED: "933891861024739410",
  WARDEN_BOT: "935378735195111474",
};

const CLIENT_IDS: Record<BotSymbol, string> = {
  ADMIN: "934105673430626304",
  ALLY: "932479363952287815",
  ARMORY_CLERK: "932307514878488666",
  BANKER: "932096908799901726",
  BIG_BROTHER: "931834426751606805",
  MART_CLERK: "934793761366618152",
  PRISONER: "932475663171063829",
  SENSEI: "932329403663413248",
  TOSSER: "931854952618426398",
  WARDEN: "932477734750404688",
};

export default {
  CATEGORY_IDS,
  CHANNEL_IDS,
  CLIENT_IDS,
  GENERAL,
  ROLE_IDS,
};
