import { Category } from "data/types";
import Config from "config";
import { OverwriteResolvable } from "discord.js";

const READ_ONLY: OverwriteResolvable[] = [
  {
    id: Config.roleId("EVERYONE"),
    deny: [
      "VIEW_CHANNEL",
      "SEND_MESSAGES",
      "CREATE_PUBLIC_THREADS",
      "CREATE_PRIVATE_THREADS",
    ],
  },
  {
    id: Config.roleId("DEGEN"),
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: Config.roleId("VERIFIED"),
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: Config.roleId("PRISONER"),
    deny: ["VIEW_CHANNEL"],
  },
  {
    id: Config.roleId("BIG_BROTHER_BOT"),
    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
  },
];

const structure: Category[] = [];

const DISCOVERABLE: OverwriteResolvable[] = [
  {
    id: Config.roleId("EVERYONE"),
    deny: ["VIEW_CHANNEL"],
  },
  {
    id: Config.roleId("VERIFIED"),
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: Config.roleId("DEGEN"),
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: Config.roleId("PRISONER"),
    deny: ["VIEW_CHANNEL"],
  },
];

const ESTABLISHMENT: OverwriteResolvable[] = [
  {
    id: Config.roleId("ESTABLISHMENT"),
    allow: ["VIEW_CHANNEL"],
  },
];

structure.push({
  symbol: "THE_GAME",
  name: "The Game",
  permissionOverwrites: [...ESTABLISHMENT],
  channels: [
    {
      symbol: "ENTRANCE",
      name: "\u{1f02b}\uff5centrance",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "QUESTS",
      name: "\u2658\uff5cquests",
      lockPermissions: true,
      permissionOverwrites: [...DISCOVERABLE, ...READ_ONLY],
    },
  ],
});

structure.push({
  symbol: "COMMAND_CENTER",
  name: "Command Center",
  permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  channels: [
    {
      symbol: "ANNOUNCEMENTS",
      name: "\u2621\uff5cannouncements",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
    {
      symbol: "LEADERBOARD",
      name: "\u2042\uff5cleaderboard",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
    {
      symbol: "COMMANDS",
      name: "\u2318\uff5ccommands",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
    {
      symbol: "FAQ",
      name: "\u2637\uff5cfaq",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
  ],
});

structure.push({
  symbol: "COMMUNITY",
  name: "Community",
  permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  channels: [
    {
      symbol: "WELCOME_ROOM",
      name: "\u22c8\uff5cwelcome-room",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
    {
      symbol: "GENERAL",
      name: "\u20aa\uff5cgeneral",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "FEEDBACK",
      name: "\u22b1\uff5cfeedback",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "HALL_OF_PRIVACY",
      name: "\u2205\uff5chall-of-privacy",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
  ],
});

structure.push({
  symbol: "BEAUTOPIA",
  name: "Beautopia",
  permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  channels: [
    {
      symbol: "TOWN_SQUARE",
      name: "\u2ff4\uff5ctown-square",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "METRO",
      name: "\u03c6\uff5cmetro",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
    {
      symbol: "TAVERN",
      name: "\u2248\uff5ctavern",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "HALL_OF_ALLEIGANCE",
      name: "\u04a7\uff5chall-of-allegiance",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
    {
      symbol: "MART",
      name: "\u1789\uff5cmerris-mart",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: Config.roleId("MART_CLERK_BOT"),
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      symbol: "ARMORY",
      name: "\u23e3\uff5cthe-armory",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: Config.roleId("ARMORY_CLERK_BOT"),
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      symbol: "TOSS_HOUSE",
      name: "\u2609\uff5cteds-toss-house",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: Config.roleId("TOSSER_BOT"),
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      symbol: "BANK",
      name: "\u1368\uff5cbank-of-beautopia",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: Config.roleId("BANKER_BOT"),
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      symbol: "ARENA",
      name: "\u0436\uff5cthe-arena",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: Config.roleId("SENSEI_BOT"),
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      symbol: "TRAINING_DOJO",
      name: "\u2059\uff5ctraining-dojo",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: Config.roleId("SENSEI_BOT"),
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
  ],
});

structure.push({
  symbol: "THE_PROJECTS_D1",
  name: "The Projects D1",
  permissionOverwrites: [...ESTABLISHMENT],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D2",
  name: "The Projects D2",
  permissionOverwrites: [...ESTABLISHMENT],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D3",
  name: "The Projects D3",
  permissionOverwrites: [...ESTABLISHMENT],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D4",
  name: "The Projects D4",
  permissionOverwrites: [...ESTABLISHMENT],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D5",
  name: "The Projects D5",
  permissionOverwrites: [...ESTABLISHMENT],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D6",
  name: "The Projects D6",
  permissionOverwrites: [...ESTABLISHMENT],
  channels: [],
});

structure.push({
  symbol: "THE_SHELTERS",
  name: "The Shelters",
  permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  channels: [
    {
      symbol: "BULLSEYE",
      name: "\u25c9\uff5cbullseye",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "THE_GRID",
      name: "\u25a6\uff5cbullseye",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "THE_LEFT",
      name: "\u25e7\uff5cthe-left",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "THE_RIGHT",
      name: "\u25e8\uff5cthe-right",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "VULTURE",
      name: "\u{13182}\uff5cvulture",
      lockPermissions: true,
      permissionOverwrites: [],
    },
  ],
});

structure.push({
  symbol: "PRISON",
  name: "Prison",
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("WARDEN_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("THOUGHT_POLICE"),
      allow: ["VIEW_CHANNEL"],
    },
  ],
  channels: [
    {
      symbol: "GEN_POP",
      name: "\u25a5\uff5cgen-pop",
      lockPermissions: true,
      permissionOverwrites: [],
    },
  ],
});

export default structure;
