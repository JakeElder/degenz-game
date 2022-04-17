import { ManagedChannel } from "data/db";
import { RecursivePartial } from "data/types";
import { plainToInstance } from "class-transformer";

const READ_ONLY: ManagedChannel["permissionOverwrites"] = [
  {
    id: "EVERYONE",
    deny: [
      "VIEW_CHANNEL",
      "SEND_MESSAGES",
      "CREATE_PUBLIC_THREADS",
      "CREATE_PRIVATE_THREADS",
    ],
  },
  {
    id: "DEGEN",
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: "VERIFIED",
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: "PRISONER",
    deny: ["VIEW_CHANNEL"],
  },
  {
    id: "BIG_BROTHER_BOT",
    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
  },
];

const DISCOVERABLE: ManagedChannel["permissionOverwrites"] = [
  {
    id: "EVERYONE",
    deny: ["VIEW_CHANNEL"],
  },
  {
    id: "VERIFIED",
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: "DEGEN",
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: "PRISONER",
    deny: ["VIEW_CHANNEL"],
  },
];

const ESTABLISHMENT: ManagedChannel["permissionOverwrites"] = [
  {
    id: "ESTABLISHMENT",
    allow: ["VIEW_CHANNEL"],
  },
];

const c: RecursivePartial<ManagedChannel>[] = [];

c.push(
  // THE_GAME
  {
    id: "THE_GAME",
    name: "The Game",
    permissionOverwrites: [...ESTABLISHMENT],
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
    permissionOverwrites: [...DISCOVERABLE, ...READ_ONLY],
    parent: { id: "THE_GAME" },
  }
);

c.push(
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
    lockPermissions: false,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "LEADERBOARD",
    name: "🏆｜leaderboard",
    lockPermissions: false,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "COMMANDS",
    name: "📜｜commands",
    lockPermissions: false,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "FAQ",
    name: "❓｜faq",
    lockPermissions: false,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  },
  {
    id: "WHITELIST",
    name: "🎟️｜whitelist",
    lockPermissions: false,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMAND_CENTER" },
  }
);

c.push(
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
    id: "HALL_OF_PRIVACY",
    name: "👁️｜hall-of-privacy",
    lockPermissions: false,
    permissionOverwrites: READ_ONLY,
    parent: { id: "COMMUNITY" },
  }
);

c.push(
  // BEAUTOPIA
  {
    id: "BEAUTOPIA",
    name: "Beautopia",
    permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  },
  // CHANNELS
  {
    id: "TOWN_SQUARE",
    name: "🕍｜town-square",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "BEAUTOPIA" },
  },
  {
    id: "METRO",
    name: "🚇｜metro",
    lockPermissions: true,
    permissionOverwrites: READ_ONLY,
    parent: { id: "BEAUTOPIA" },
  },
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
    id: "MART",
    name: "🏪｜merris-mart",
    lockPermissions: true,
    permissionOverwrites: [
      {
        id: "MART_CLERK_BOT",
        allow: ["VIEW_CHANNEL"],
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
        id: "ARMORY_CLERK_BOT",
        allow: ["VIEW_CHANNEL"],
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
        id: "TOSSER_BOT",
        allow: ["VIEW_CHANNEL"],
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
        id: "BANKER_BOT",
        allow: ["VIEW_CHANNEL"],
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
        id: "SENSEI_BOT",
        allow: ["VIEW_CHANNEL"],
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
        id: "SENSEI_BOT",
        allow: ["VIEW_CHANNEL"],
      },
    ],
    parent: { id: "BEAUTOPIA" },
  }
);

c.push({
  id: "THE_PROJECTS_D1",
  name: "The Projects D1",
  permissionOverwrites: [...ESTABLISHMENT],
});

c.push({
  id: "THE_PROJECTS_D2",
  name: "The Projects D2",
  permissionOverwrites: [...ESTABLISHMENT],
});

c.push({
  id: "THE_PROJECTS_D3",
  name: "The Projects D3",
  permissionOverwrites: [...ESTABLISHMENT],
});

c.push({
  id: "THE_PROJECTS_D4",
  name: "The Projects D4",
  permissionOverwrites: [...ESTABLISHMENT],
});

c.push({
  id: "THE_PROJECTS_D5",
  name: "The Projects D5",
  permissionOverwrites: [...ESTABLISHMENT],
});

c.push({
  id: "THE_PROJECTS_D6",
  name: "The Projects D6",
  permissionOverwrites: [...ESTABLISHMENT],
});

c.push(
  // THE_SHELTERS
  {
    id: "THE_SHELTERS",
    name: "The Shelters",
    permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  },
  // CHANNELS
  {
    id: "BULLSEYE",
    name: "\u25c9\uff5cbullseye",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  },
  {
    id: "THE_GRID",
    name: "\u25a6\uff5cthe-grid",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  },
  {
    id: "THE_LEFT",
    name: "\u25e7\uff5cthe-left",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  },
  {
    id: "THE_RIGHT",
    name: "\u25e8\uff5cthe-right",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  },
  {
    id: "VULTURE",
    name: "\u{13182}\uff5cvulture",
    lockPermissions: true,
    permissionOverwrites: [],
    parent: { id: "THE_SHELTERS" },
  }
);

c.push(
  // PRISON
  {
    id: "PRISON",
    name: "Prison",
    permissionOverwrites: [
      {
        id: "EVERYONE",
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: "WARDEN_BOT",
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: "PRISONER",
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: "PRISONER_BOT",
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: "THOUGHT_POLICE",
        allow: ["VIEW_CHANNEL"],
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

export const channels = plainToInstance(ManagedChannel, c);
