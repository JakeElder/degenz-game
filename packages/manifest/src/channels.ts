import { ManagedChannel } from "data/db";
import { RecursivePartial } from "data/types";

const READ_ONLY: ManagedChannel["permissionOverwrites"] = [
  {
    roles: ["EVERYONE"],
    options: {
      SEND_MESSAGES: false,
    },
  },
  {
    roles: ["PREGEN", "DEGEN", "BIG_BROTHER_BOT"],
    options: {
      VIEW_CHANNEL: true,
    },
  },
  {
    roles: ["PRISONER"],
    options: {
      VIEW_CHANNEL: false,
    },
  },
  {
    roles: ["BIG_BROTHER_BOT"],
    options: {
      SEND_MESSAGES: true,
    },
  },
];

const DISCOVERABLE: ManagedChannel["permissionOverwrites"] = [
  {
    roles: ["EVERYONE"],
    options: {
      VIEW_CHANNEL: false,
    },
  },
  {
    roles: ["PREGEN", "DEGEN"],
    options: {
      VIEW_CHANNEL: true,
    },
  },
  {
    roles: ["PRISONER"],
    options: {
      VIEW_CHANNEL: false,
    },
  },
];

const ESTABLISHMENT: ManagedChannel["permissionOverwrites"] = [
  {
    roles: ["ESTABLISHMENT"],
    options: {
      VIEW_CHANNEL: true,
    },
  },
];

const channels: RecursivePartial<ManagedChannel>[] = [];

channels.push(
  // THE_GAME
  {
    id: "THE_GAME",
    name: "The Game",
    permissionOverwrites: [
      ...READ_ONLY,
      {
        roles: ["EVERYONE"],
        options: { VIEW_CHANNEL: true },
      },
    ],
  },
  // CHANNELS
  {
    id: "ENTRANCE",
    name: "🚪｜entrance",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_GAME" },
  },
  {
    id: "QUESTS",
    name: "🕹️｜quests",
    lockPermissions: true,
    permissionOverwrites: DISCOVERABLE,
    parent: { id: "THE_GAME" },
  },
  {
    id: "INVITE",
    name: "🙋｜invite-to-win",
    lockPermissions: true,
    permissionOverwrites: DISCOVERABLE,
    parent: { id: "THE_GAME" },
  },
  {
    id: "WHITELIST",
    name: "🎟️｜whitelist",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "THE_GAME" },
  }
);

channels.push(
  // ORIENTATION
  {
    id: "ORIENTATION",
    name: "Orientation",
    permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  },
  // CHANNELS
  {
    id: "THE_LORE",
    name: "🌃｜the-lore",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "ORIENTATION" },
  },
  {
    id: "NFT_CHARACTERS",
    name: "🧑｜nft-character",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "ORIENTATION" },
  },
  {
    id: "COMMANDS",
    name: "📜｜how-to-play",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "ORIENTATION" },
  }
);

channels.push(
  // COMMAND_CENTER
  {
    id: "COMMAND_CENTER",
    name: "Command Center",
    permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  },
  // CHANNELS
  {
    id: "ANNOUNCEMENTS",
    name: "📣｜announcements",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "UPDATES",
    name: "🚨｜updates",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "OFFICIAL_LINKS",
    name: "🔗｜official-links",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "SNEAK_PEEKS",
    name: "👀｜sneak-peaks",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "GIVEAWAYS",
    name: "🎉｜giveaways",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "TWEETS",
    name: "🐦｜tweets",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "RAIDS",
    name: "💥｜raids",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "FAQ",
    name: "❓｜faq",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  }
);

channels.push(
  // COMMUNITY
  {
    id: "COMMUNITY",
    name: "Community",
    permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  },
  // CHANNELS
  {
    id: "WELCOME_ROOM",
    name: "👋｜welcome-room",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMUNITY" },
  },
  {
    id: "GENERAL",
    name: "💬｜general",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "COMMUNITY" },
  },
  {
    id: "FEEDBACK",
    name: "🤌｜feedback",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "COMMUNITY" },
  },
  {
    id: "LEADERBOARD",
    name: "🏆｜leaderboard",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMUNITY" },
  },
  {
    id: "HALL_OF_PRIVACY",
    name: "👁️｜hall-of-privacy",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMUNITY" },
  }
);

channels.push(
  // BEAUTOPIA
  {
    id: "BEAUTOPIA",
    name: "Beautopia",
    permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  },
  // CHANNELS
  // {
  //   id: "TOWN_SQUARE",
  //   name: "🕍｜town-square",
  //   lockPermissions: true,
  //   permissionOverwrites: [],
  //   parent: { id: "BEAUTOPIA" },
  // },
  // {
  //   id: "METRO",
  //   name: "🚇｜metro",
  //   lockPermissions: true,
  //   permissionOverwrites: READ_ONLY,
  //   parent: { id: "BEAUTOPIA" },
  // },
  {
    id: "TAVERN",
    name: "🍺｜tavern",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "HALL_OF_ALLEIGANCE",
    name: "💰｜hall-of-allegiance",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "JPEG_STORE",
    name: "🖼｜jpeg-store",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "MART",
    name: "🏪｜merris-mart",
    lockPermissions: true,
    permissionOverwrites: [
      {
        roles: ["MART_CLERK_BOT"],
        options: {
          VIEW_CHANNEL: true,
        },
      },
    ],
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "ARMORY",
    name: "🛡｜the-armory",
    lockPermissions: true,
    permissionOverwrites: [
      {
        roles: ["ARMORY_CLERK_BOT"],
        options: {
          VIEW_CHANNEL: true,
        },
      },
    ],
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "TOSS_HOUSE",
    name: "🎲｜teds-toss-house",
    lockPermissions: true,
    permissionOverwrites: [
      {
        roles: ["TOSSER_BOT"],
        options: {
          VIEW_CHANNEL: true,
        },
      },
    ],
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "BANK",
    name: "🏦｜bank-of-beautopia",
    lockPermissions: true,
    permissionOverwrites: [
      {
        roles: ["BANKER_BOT"],
        options: {
          VIEW_CHANNEL: true,
        },
      },
    ],
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "ARENA",
    name: "🗡｜the-arena",
    lockPermissions: true,
    permissionOverwrites: [
      {
        roles: ["SENSEI_BOT"],
        options: {
          VIEW_CHANNEL: true,
        },
      },
    ],
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "TRAINING_DOJO",
    name: "⛩️｜training-dojo",
    lockPermissions: true,
    permissionOverwrites: [
      {
        roles: ["SENSEI_BOT"],
        options: {
          VIEW_CHANNEL: true,
        },
      },
    ],
    parent: { id: "BEAUTOPIA" },
  }
);

channels.push({
  id: "THE_PROJECTS_D1",
  name: "The Projects D1",
  permissionOverwrites: [...ESTABLISHMENT],
});

channels.push({
  id: "THE_PROJECTS_D2",
  name: "The Projects D2",
  permissionOverwrites: [...ESTABLISHMENT],
});

channels.push({
  id: "THE_PROJECTS_D3",
  name: "The Projects D3",
  permissionOverwrites: [...ESTABLISHMENT],
});

channels.push({
  id: "THE_PROJECTS_D4",
  name: "The Projects D4",
  permissionOverwrites: [...ESTABLISHMENT],
});

channels.push({
  id: "THE_PROJECTS_D5",
  name: "The Projects D5",
  permissionOverwrites: [...ESTABLISHMENT],
});

channels.push({
  id: "THE_PROJECTS_D6",
  name: "The Projects D6",
  permissionOverwrites: [...ESTABLISHMENT],
});

channels.push(
  // THE_SHELTERS
  {
    id: "THE_SHELTERS",
    name: "The Shelters",
    permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  },
  // CHANNELS
  {
    id: "BULLSEYE",
    name: "\u25c9｜bullseye",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  },
  {
    id: "THE_GRID",
    name: "\u25a6｜the-grid",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  },
  {
    id: "THE_LEFT",
    name: "\u25e7｜the-left",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  },
  {
    id: "THE_RIGHT",
    name: "\u25e8｜the-right",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  },
  {
    id: "VULTURE",
    name: "\u{13182}｜vulture",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  }
);

channels.push(
  // TICKETS
  {
    id: "TICKETS",
    name: "Tickets",
    permissionOverwrites: DISCOVERABLE,
  },
  // CHANNELS
  {
    id: "SUPPORT",
    name: "support",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "TICKETS" },
  }
);

channels.push(
  // PRISON
  {
    id: "PRISON",
    name: "Prison",
    permissionOverwrites: [
      {
        roles: ["EVERYONE"],
        options: {
          VIEW_CHANNEL: false,
        },
      },
      {
        roles: ["WARDEN_BOT", "PRISONER", "PRISONER_BOT", "THOUGHT_POLICE"],
        options: {
          VIEW_CHANNEL: true,
        },
      },
    ],
  },
  // CHANNELS
  {
    id: "GEN_POP",
    name: "👥｜gen-pop",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "PRISON" },
  },
  {
    id: "SOLITARY",
    name: "\u2b1b｜solitary",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "PRISON" },
  }
);

export { channels };
