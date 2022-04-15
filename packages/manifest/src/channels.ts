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

const channels: RecursivePartial<ManagedChannel>[] = [];

channels.push({
  id: "THE_GAME",
  name: "The Game",
  permissionOverwrites: [...ESTABLISHMENT],
  children: [
    {
      id: "ENTRANCE",
      name: "\u{1f02b}\uff5centrance",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "QUESTS",
      name: "\u2658\uff5cquests",
      lockPermissions: true,
      permissionOverwrites: [...DISCOVERABLE, ...READ_ONLY],
    },
  ],
});

channels.push({
  id: "COMMAND_CENTER",
  name: "Command Center",
  permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  children: [
    {
      id: "ANNOUNCEMENTS",
      name: "\u2621\uff5cannouncements",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
    {
      id: "LEADERBOARD",
      name: "\u2042\uff5cleaderboard",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
    {
      id: "COMMANDS",
      name: "\u2318\uff5ccommands",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
    {
      id: "FAQ",
      name: "\u2637\uff5cfaq",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
  ],
});

channels.push({
  id: "COMMUNITY",
  name: "Community",
  permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  children: [
    {
      id: "WELCOME_ROOM",
      name: "\u22c8\uff5cwelcome-room",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
    {
      id: "GENERAL",
      name: "\u20aa\uff5cgeneral",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "FEEDBACK",
      name: "\u22b1\uff5cfeedback",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "HALL_OF_PRIVACY",
      name: "\u2205\uff5chall-of-privacy",
      lockPermissions: false,
      permissionOverwrites: READ_ONLY,
    },
  ],
});

channels.push({
  id: "BEAUTOPIA",
  name: "Beautopia",
  permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  children: [
    {
      id: "TOWN_SQUARE",
      name: "\u2ff4\uff5ctown-square",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "METRO",
      name: "\u03c6\uff5cmetro",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
    {
      id: "TAVERN",
      name: "\u2248\uff5ctavern",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "HALL_OF_ALLEIGANCE",
      name: "\u04a7\uff5chall-of-allegiance",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
    {
      id: "MART",
      name: "\u1789\uff5cmerris-mart",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: "MART_CLERK_BOT",
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      id: "ARMORY",
      name: "\u23e3\uff5cthe-armory",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: "ARMORY_CLERK_BOT",
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      id: "TOSS_HOUSE",
      name: "\u2609\uff5cteds-toss-house",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: "TOSSER_BOT",
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      id: "BANK",
      name: "\u1368\uff5cbank-of-beautopia",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: "BANKER_BOT",
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      id: "ARENA",
      name: "\u0436\uff5cthe-arena",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: "SENSEI_BOT",
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
    {
      id: "TRAINING_DOJO",
      name: "\u2059\uff5ctraining-dojo",
      lockPermissions: true,
      permissionOverwrites: [
        {
          id: "SENSEI_BOT",
          allow: ["VIEW_CHANNEL"],
        },
      ],
    },
  ],
});

channels.push({
  id: "THE_PROJECTS_D1",
  name: "The Projects D1",
  permissionOverwrites: [...ESTABLISHMENT],
});

channels.push({
  id: "THE_PROJECTS_D2",
  name: "The Projects D2",
  permissionOverwrites: [...ESTABLISHMENT],
  children: [],
});

channels.push({
  id: "THE_PROJECTS_D3",
  name: "The Projects D3",
  permissionOverwrites: [...ESTABLISHMENT],
  children: [],
});

channels.push({
  id: "THE_PROJECTS_D4",
  name: "The Projects D4",
  permissionOverwrites: [...ESTABLISHMENT],
  children: [],
});

channels.push({
  id: "THE_PROJECTS_D5",
  name: "The Projects D5",
  permissionOverwrites: [...ESTABLISHMENT],
  children: [],
});

channels.push({
  id: "THE_PROJECTS_D6",
  name: "The Projects D6",
  permissionOverwrites: [...ESTABLISHMENT],
  children: [],
});

channels.push({
  id: "THE_SHELTERS",
  name: "The Shelters",
  permissionOverwrites: [...DISCOVERABLE, ...ESTABLISHMENT],
  children: [
    {
      id: "BULLSEYE",
      name: "\u25c9\uff5cbullseye",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "THE_GRID",
      name: "\u25a6\uff5cthe-grid",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "THE_LEFT",
      name: "\u25e7\uff5cthe-left",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "THE_RIGHT",
      name: "\u25e8\uff5cthe-right",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      id: "VULTURE",
      name: "\u{13182}\uff5cvulture",
      lockPermissions: true,
      permissionOverwrites: [],
    },
  ],
});

channels.push({
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
  children: [
    {
      id: "GEN_POP",
      name: "\u25a5\uff5cgen-pop",
      lockPermissions: true,
      permissionOverwrites: [],
    },
  ],
});

export default plainToInstance(ManagedChannel, channels);
