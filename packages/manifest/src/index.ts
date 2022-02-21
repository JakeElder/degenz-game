import { Category, Role } from "types";
import Config from "app-config";
import { READ_ONLY } from "app-config/dist/constants";
import bots from "./bots";

const roles: Role[] = [
  { symbol: "ADMIN" },
  { symbol: "PRISONER" },
  { symbol: "DEGEN" },
  { symbol: "VERIFIED" },
  { symbol: "ADMIN_BOT", app: true },
  { symbol: "BIG_BROTHER_BOT", app: true },
  { symbol: "ALLY_BOT", app: true },
  { symbol: "WARDEN_BOT", app: true },
  { symbol: "TOSSER_BOT", app: true },
  { symbol: "BANKER_BOT", app: true },
  { symbol: "MART_CLERK_BOT", app: true },
  { symbol: "PRISONER_BOT", app: true },
  { symbol: "ARMORY_CLERK_BOT", app: true },
  { symbol: "SENSEI_BOT", app: true },
];

const structure: Category[] = [
  // Outside World
  {
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
  },

  // Admin
  {
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
  },

  // Community
  {
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
        symbol: "WAITING_ROOM",

        name: "\u{1f510}\uff5cwaiting-room",
        lockPermissions: true,
        permissionOverwrites: READ_ONLY,
      },
      {
        symbol: "FEEDBACK",
        name: "\u22b1\uff5cfeedback",
        lockPermissions: true,
        permissionOverwrites: [],
      },
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
        symbol: "HALL_OF_PRIVACY",
        name: "\u2205\uff5chall-of-privacy",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
      {
        symbol: "FAQ",
        name: "\u2637\uff5cfaq",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
      {
        symbol: "COMMANDS",
        name: "\u2318\uff5ccommands",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
    ],
  },

  // Beautopia
  {
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
        symbol: "HALL_OF_ALLEIGANCE",
        name: "\u2ff4\uff5chall-of-allegiance",
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
  },

  // D1
  {
    symbol: "THE_PROJECTS_D1",
    name: "The Projects D1",
    permissionOverwrites: [],
    channels: [],
  },

  // D2
  {
    symbol: "THE_PROJECTS_D2",
    name: "The Projects D2",
    permissionOverwrites: [],
    channels: [],
  },

  // D3
  {
    symbol: "THE_PROJECTS_D3",
    name: "The Projects D3",
    permissionOverwrites: [],
    channels: [],
  },

  // D4
  {
    symbol: "THE_PROJECTS_D4",
    name: "The Projects D4",
    permissionOverwrites: [],
    channels: [],
  },

  // D5
  {
    symbol: "THE_PROJECTS_D5",
    name: "The Projects D5",
    permissionOverwrites: [],
    channels: [],
  },

  // D6
  {
    symbol: "THE_PROJECTS_D6",
    name: "The Projects D6",
    permissionOverwrites: [],
    channels: [],
  },

  // Prison
  {
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
  },
];

export { structure, roles, bots };
