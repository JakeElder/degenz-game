const SERVER_CONFIG = {
  GUILD_ID: "933888229776703559",
  LEADERBOARD_MESSAGE_ID: "935854598181228545",
  VERIFICATION_MESSAGE_ID: "933958426898337802",
};

const CATEGORY_IDS = {
  ADMIN_CATEGORY_ID: "933890294431248454",
  BEAUTOPIA_CATEGORY_ID: "933888617632391199",
  COMMUNITY_CATEGORY_ID: "933888430293803068",
  OUTSIDE_WORLD_CATEGORY_ID: "933893983627776061",
  PRISON_CATEGORY_ID: "933888711551254588",
  THE_PROJECTS_D1_CATEGORY_ID: "935347742081974332",
  THE_PROJECTS_D2_CATEGORY_ID: "940477768653754409",
  THE_PROJECTS_D3_CATEGORY_ID: "940477769924620319",
  THE_PROJECTS_D4_CATEGORY_ID: "940477771895939122",
  THE_PROJECTS_D5_CATEGORY_ID: "940477773770805298",
  THE_PROJECTS_D6_CATEGORY_ID: "940477775461113916",
};

const CHANNEL_IDS = {
  ADMIN_GENERAL_CHANNEL_ID: "933890335573176370",
  ADMIN_SANDBOX_CHANNEL_ID: "933919605322305558",
  ANNOUNCEMENTS_CHANNEL_ID: "935375691887829042",
  BANK_CHANNEL_ID: "933889030351904818",
  COMMANDS_CHANNEL_ID: "938019946573742110",
  FAQ_CHANNEL_ID: "937563312957317131",
  FEEDBACK_CHANNEL_ID: "935375658928971807",
  GEN_POP_CHANNEL_ID: "933888816702447616",
  HALL_OF_PRIVACY_CHANNEL_ID: "933891153680551976",
  LEADERBOARD_CHANNEL_ID: "935852579081060402",
  MART_CHANNEL_ID: "934798922617081866",
  THE_ARENA_CHANNEL_ID: "933889934509604874",
  THE_ARMORY_CHANNEL_ID: "933890100432076841",
  TOSS_CHANNEL_ID: "933888966732697600",
  TOWN_SQUARE_CHANNEL_ID: "933888899686727730",
  TRAINING_DOJO_CHANNEL_ID: "935094852868251648",
  VERIFICATION_CHANNEL_ID: "933894136279486484",
  WAITING_ROOM_CHANNEL_ID: "933891067336597504",
};

const ROLE_IDS = {
  ADMIN_ROLE_ID: "933891976871440415",
  ALLY_BOT_ROLE_ID: "933917241148317748",
  ARMORY_CLERK_BOT_ROLE_ID: "937607880104886313",
  BANKER_BOT_ROLE_ID: "935937316231471205",
  BIG_BROTHER_BOT_ROLE_ID: "934712865590497311",
  DEGEN_ROLE_ID: "933891425710534707",
  EVERYONE_ROLE_ID: "933888229776703559",
  MART_CLERK_BOT_ROLE_ID: "934798696493756487",
  PRISONER_BOT_ROLE_ID: "935508906812264469",
  PRISONER_ROLE_ID: "933892191527526431",
  SENSEI_BOT_ROLE_ID: "937686068008984589",
  SERVER_BOOSTER_ROLE_ID: "935907794941522011",
  TOSSER_BOT_ROLE_ID: "935937038002319390",
  VERIFIED_ROLE_ID: "933891861024739410",
  WARDEN_BOT_ROLE_ID: "935378735195111474",
};

const CLIENT_IDS = {
  ADMIN_BOT_CLIENT_ID: "934105673430626304",
  ALLY_BOT_CLIENT_ID: "932479363952287815",
  ARMORY_CLERK_BOT_CLIENT_ID: "932307514878488666",
  BANKER_BOT_CLIENT_ID: "932096908799901726",
  BIG_BROTHER_BOT_CLIENT_ID: "931834426751606805",
  MART_CLERK_BOT_CLIENT_ID: "934793761366618152",
  PRISONER_BOT_CLIENT_ID: "932475663171063829",
  SENSEI_BOT_CLIENT_ID: "932329403663413248",
  TOSSER_BOT_CLIENT_ID: "931854952618426398",
  WARDEN_BOT_CLIENT_ID: "932477734750404688",
};

export default {
  ...SERVER_CONFIG,
  ...CATEGORY_IDS,
  ...CHANNEL_IDS,
  ...ROLE_IDS,
  ...CLIENT_IDS,
  BOT_CLIENT_IDS: Object.values(CLIENT_IDS),
  DISTRICT_CAPACITY: 50,
  SKIP_DELAY: false,
};
