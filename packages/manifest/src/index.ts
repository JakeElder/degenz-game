import { Category, Role } from "types";
import Config from "app-config";
import { READ_ONLY } from "app-config/dist/constants";

const roles: Role[] = [
  { id: "ADMIN" },
  { id: "PRISONER" },
  { id: "DEGEN" },
  { id: "VERIFIED" },
  { id: "ADMIN_BOT", app: true },
  { id: "BIG_BROTHER_BOT", app: true },
  { id: "ALLY_BOT", app: true },
  { id: "WARDEN_BOT", app: true },
  { id: "TOSSER_BOT", app: true },
  { id: "BANKER_BOT", app: true },
  { id: "MART_CLERK_BOT", app: true },
  { id: "PRISONER_BOT", app: true },
  { id: "ARMORY_CLERK_BOT", app: true },
  { id: "SENSEI_BOT", app: true },
];

const structure: Category[] = [
  // Outside World
  {
    id: "OUTSIDE_WORLD",
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
        id: "VERIFICATION",
        name: "\u235d\uff5cverification",
        lockPermissions: false,
        permissionOverwrites: [],
      },
    ],
  },

  // Admin
  {
    id: "ADMIN",
    name: "Admin",
    permissionOverwrites: [
      {
        id: Config.roleId("EVERYONE"),
        deny: ["VIEW_CHANNEL"],
      },
    ],
    channels: [
      {
        id: "ADMIN_GENERAL",
        name: "\u22c8\uff5cgeneral",
        lockPermissions: true,
        permissionOverwrites: [],
      },
      {
        id: "ADMIN_SANDBOX",
        name: "\u2668\uff5csandbox",
        lockPermissions: true,
        permissionOverwrites: [],
      },
    ],
  },

  // Community
  {
    id: "COMMUNITY",
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
        id: "WAITING_ROOM",
        name: "\u22c8\uff5cwaiting-room",
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
        id: "HALL_OF_PRIVACY",
        name: "\u2205\uff5chall-of-privacy",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
      {
        id: "FAQ",
        name: "\u2637\uff5cfaq",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
      {
        id: "COMMANDS",
        name: "\u2318\uff5ccommands",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
    ],
  },

  // Beautopia
  {
    id: "BEAUTOPIA",
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
        id: "TOWN_SQUARE",
        name: "\u2ff4\uff5ctown-square",
        lockPermissions: true,
        permissionOverwrites: [],
      },
      {
        id: "MART",
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
        id: "TOSS_HOUSE",
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
        id: "BANK",
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
        id: "ARENA",
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
        id: "ARMORY",
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
        id: "TRAINING_DOJO",
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
    id: "THE_PROJECTS_D1",
    name: "The Projects D1",
    permissionOverwrites: [],
    channels: [],
  },

  // D2
  {
    id: "THE_PROJECTS_D2",
    name: "The Projects D2",
    permissionOverwrites: [],
    channels: [],
  },

  // D3
  {
    id: "THE_PROJECTS_D3",
    name: "The Projects D3",
    permissionOverwrites: [],
    channels: [],
  },

  // D4
  {
    id: "THE_PROJECTS_D4",
    name: "The Projects D4",
    permissionOverwrites: [],
    channels: [],
  },

  // D5
  {
    id: "THE_PROJECTS_D5",
    name: "The Projects D5",
    permissionOverwrites: [],
    channels: [],
  },

  // D6
  {
    id: "THE_PROJECTS_D6",
    name: "The Projects D6",
    permissionOverwrites: [],
    channels: [],
  },

  // Prison
  {
    id: "PRISON",
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
        id: "GEN_POP",
        name: "\u25a5\uff5cgen-pop",
        lockPermissions: true,
        permissionOverwrites: [],
      },
    ],
  },
];

export { structure, roles };
