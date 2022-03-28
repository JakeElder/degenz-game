import { Category, Role } from "data/types";
import Config from "config";
import { READ_ONLY, READ_ONLY_BEAUTOPIA } from "config/dist/constants";
import bots from "./bots";

const roles: Role[] = [
  {
    symbol: "ADMIN",
    name: "Admin",
    permissions: "1071698660937",
  },
  {
    symbol: "PRISONER",
    name: "Prisoner",
    permissions: "1071698659905",
  },
  {
    symbol: "DEGEN",
    name: "Degen",
    permissions: "1071698660929",
  },
  {
    symbol: "VERIFIED",
    name: "Verified",
    permissions: "1071698660929",
  },
  {
    symbol: "TRAINEE",
    name: "Trainee",
    permissions: "1071698529856",
  },
  { symbol: "ADMIN_BOT", managed: true },
  { symbol: "BIG_BROTHER_BOT", managed: true },
  { symbol: "DEVILS_ADVOCATE_BOT", managed: true },
  { symbol: "ALLY_BOT", managed: true },
  { symbol: "WARDEN_BOT", managed: true },
  { symbol: "TOSSER_BOT", managed: true },
  { symbol: "BANKER_BOT", managed: true },
  { symbol: "MART_CLERK_BOT", managed: true },
  { symbol: "PRISONER_BOT", managed: true },
  { symbol: "ARMORY_CLERK_BOT", managed: true },
  { symbol: "SENSEI_BOT", managed: true },
  { symbol: "D1_CITIZEN", citizen: true, name: "D1 Citizen", color: "#edb500" },
  { symbol: "D2_CITIZEN", citizen: true, name: "D2 Citizen", color: "#9b65e3" },
  { symbol: "D3_CITIZEN", citizen: true, name: "D3 Citizen", color: "#9b65e3" },
  { symbol: "D4_CITIZEN", citizen: true, name: "D4 Citizen", color: "#9b65e3" },
  { symbol: "D5_CITIZEN", citizen: true, name: "D5 Citizen", color: "#9b65e3" },
  { symbol: "D6_CITIZEN", citizen: true, name: "D6 Citizen", color: "#9b65e3" },
  {
    symbol: "BULLSEYE_CITIZEN",
    citizen: true,
    name: "Bullseye Citizen",
    color: "#379de6",
  },
  {
    symbol: "THE_GRID_CITIZEN",
    citizen: true,
    name: "The Grid Citizen",
    color: "#379de6",
  },
  {
    symbol: "THE_LEFT_CITIZEN",
    citizen: true,
    name: "The Left Citizen",
    color: "#379de6",
  },
  {
    symbol: "THE_RIGHT_CITIZEN",
    citizen: true,
    name: "The Right Citizen",
    color: "#379de6",
  },
  {
    symbol: "VULTURE_CITIZEN",
    citizen: true,
    name: "Vulture Citizen",
    color: "#379de6",
  },
];

const structure: Category[] = [];

structure.push({
  symbol: "OUTSIDE_WORLD",
  name: "Outside World",
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: [
        "SEND_MESSAGES",
        "CREATE_PUBLIC_THREADS",
        "USE_APPLICATION_COMMANDS",
      ],
    },
    {
      id: Config.roleId("BIG_BROTHER_BOT"),
      allow: ["SEND_MESSAGES"],
    },
    {
      id: Config.roleId("VERIFIED"),
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("DEGEN"),
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER"),
      deny: ["VIEW_CHANNEL"],
    },
  ],
  channels: [
    {
      symbol: "VERIFICATION",
      name: "\u235d\uff5cverification",
      lockPermissions: true,
      permissionOverwrites: [],
    },
  ],
});

structure.push({
  symbol: "ADMIN",
  name: "Admin",
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: ["VIEW_CHANNEL"],
    },
  ],
  channels: [
    {
      symbol: "ADMIN_GENERAL",
      name: "\u22c8\uff5cgeneral",
      lockPermissions: true,
      permissionOverwrites: [],
    },
    {
      symbol: "ADMIN_SANDBOX",
      name: "\u2668\uff5csandbox",
      lockPermissions: true,
      permissionOverwrites: [],
    },
  ],
});

structure.push({
  symbol: "ENTRANCE",
  name: "Entrance",
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: ["VIEW_CHANNEL"],
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
      id: Config.roleId("BIG_BROTHER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER"),
      deny: ["VIEW_CHANNEL"],
    },
  ],
  channels: [
    {
      symbol: "WELCOME_ROOM",
      name: "\u22c8\uff5cwelcome-room",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
    {
      symbol: "ORIENTATION",
      name: "\u22c8\uff5corientation",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
  ],
});

structure.push({
  symbol: "JOIN_THE_GAME",
  name: "Join The Game",
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: ["VIEW_CHANNEL"],
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
      id: Config.roleId("BIG_BROTHER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER"),
      deny: ["VIEW_CHANNEL"],
    },
  ],
  channels: [
    {
      symbol: "ENTER_THE_PROJECTS",
      name: "\u{1f510}\uff5cthe-projects",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
    {
      symbol: "ENTER_THE_SHELTERS",
      name: "\u{1f510}\uff5cthe-shelters",
      lockPermissions: true,
      permissionOverwrites: READ_ONLY,
    },
  ],
});

structure.push({
  symbol: "COMMAND_CENTER",
  name: "Command Center",
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: ["VIEW_CHANNEL"],
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
      id: Config.roleId("BIG_BROTHER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER"),
      deny: ["VIEW_CHANNEL"],
    },
  ],
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
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: ["VIEW_CHANNEL"],
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
      id: Config.roleId("BIG_BROTHER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER"),
      deny: ["VIEW_CHANNEL"],
    },
  ],
  channels: [
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
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER"),
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("DEGEN"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("BIG_BROTHER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
  ],
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
      permissionOverwrites: READ_ONLY_BEAUTOPIA,
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
      permissionOverwrites: READ_ONLY_BEAUTOPIA,
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
  permissionOverwrites: [],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D2",
  name: "The Projects D2",
  permissionOverwrites: [],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D3",
  name: "The Projects D3",
  permissionOverwrites: [],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D4",
  name: "The Projects D4",
  permissionOverwrites: [],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D5",
  name: "The Projects D5",
  permissionOverwrites: [],
  channels: [],
});

structure.push({
  symbol: "THE_PROJECTS_D6",
  name: "The Projects D6",
  permissionOverwrites: [],
  channels: [],
});

structure.push({
  symbol: "THE_SHELTERS",
  name: "The Shelters",
  permissionOverwrites: [
    {
      id: Config.roleId("EVERYONE"),
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER"),
      deny: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("DEGEN"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("BIG_BROTHER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("ALLY_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("TOSSER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("MART_CLERK_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("SENSEI_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("WARDEN_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
    {
      id: Config.roleId("PRISONER_BOT"),
      allow: ["VIEW_CHANNEL"],
    },
  ],
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

export { structure, roles, bots };
