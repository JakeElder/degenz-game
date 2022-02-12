import { Category } from "types";
import {
  ARMORY_CLERK_BOT_ROLE_ID,
  BANKER_BOT_ROLE_ID,
  BIG_BROTHER_BOT_ROLE_ID,
  DEGEN_ROLE_ID,
  EVERYONE_ROLE_ID,
  MART_CLERK_BOT_ROLE_ID,
  PRISONER_BOT_ROLE_ID,
  PRISONER_ROLE_ID,
  READ_ONLY,
  SENSEI_BOT_ROLE_ID,
  TOSSER_BOT_ROLE_ID,
  VERIFIED_ROLE_ID,
  WARDEN_BOT_ROLE_ID,
} from "./constants";

const structure: Category[] = [
  // Outside World
  {
    id: "OUTSIDE_WORLD_CATEGORY",
    name: "Outside World",
    permissionOverwrites: [
      {
        id: EVERYONE_ROLE_ID,
        deny: [
          "SEND_MESSAGES",
          "CREATE_PUBLIC_THREADS",
          "USE_APPLICATION_COMMANDS",
        ],
      },
      {
        id: BIG_BROTHER_BOT_ROLE_ID,
        allow: ["SEND_MESSAGES"],
      },
      {
        id: VERIFIED_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: DEGEN_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: PRISONER_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
    ],
    channels: [
      {
        id: "VERIFICATION_CHANNEL",
        name: "\u235d\uff5cverification",
        lockPermissions: false,
        permissionOverwrites: [],
      },
    ],
  },

  // Admin
  {
    id: "ADMIN_CATEGORY",
    name: "Admin",
    permissionOverwrites: [
      {
        id: EVERYONE_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
    ],
    channels: [
      {
        id: "ADMIN_GENERAL_CHANNEL",
        name: "\u22c8\uff5cgeneral",
        lockPermissions: true,
        permissionOverwrites: [],
      },
      {
        id: "ADMIN_SANDBOX_CHANNEL",
        name: "\u2668\uff5csandbox",
        lockPermissions: true,
        permissionOverwrites: [],
      },
    ],
  },

  // Community
  {
    id: "COMMUNITY_CATEGORY",
    name: "Community",
    permissionOverwrites: [
      {
        id: EVERYONE_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: DEGEN_ROLE_ID,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: VERIFIED_ROLE_ID,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: BIG_BROTHER_BOT_ROLE_ID,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: PRISONER_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
    ],
    channels: [
      {
        id: "WAITING_ROOM_CHANNEL",
        name: "\u22c8\uff5cwaiting-room",
        lockPermissions: true,
        permissionOverwrites: [],
      },
      {
        id: "FEEDBACK_CHANNEL",
        name: "\u22b1\uff5cfeedback",
        lockPermissions: true,
        permissionOverwrites: [],
      },
      {
        id: "ANNOUNCEMENTS_CHANNEL",
        name: "\u2621\uff5cannouncements",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
      {
        id: "LEADERBOARD_CHANNEL",
        name: "\u2042\uff5cleaderboard",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
      {
        id: "HALL_OF_PRIVACY_CHANNEL",
        name: "\u2205\uff5chall-of-privacy",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
      {
        id: "FAQ_CHANNEL",
        name: "\u2637\uff5cfaq",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
      {
        id: "COMMANDS_CHANNEL",
        name: "\u2318\uff5ccommands",
        lockPermissions: false,
        permissionOverwrites: READ_ONLY,
      },
    ],
  },

  // Beautopia
  {
    id: "BEAUTOPIA_CATEGORY",
    name: "Beautopia",
    permissionOverwrites: [
      {
        id: EVERYONE_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: PRISONER_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: DEGEN_ROLE_ID,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: BIG_BROTHER_BOT_ROLE_ID,
        allow: ["VIEW_CHANNEL"],
      },
    ],
    channels: [
      {
        id: "TOWN_SQUARE_CHANNEL",
        name: "\u2ff4\uff5ctown-square",
        lockPermissions: true,
        permissionOverwrites: [],
      },
      {
        id: "MART_CHANNEL",
        name: "\u1789\uff5cmerris-mart",
        lockPermissions: true,
        permissionOverwrites: [
          {
            id: MART_CLERK_BOT_ROLE_ID,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      },
      {
        id: "TOSS_CHANNEL",
        name: "\u2609\uff5cteds-toss-house",
        lockPermissions: true,
        permissionOverwrites: [
          {
            id: TOSSER_BOT_ROLE_ID,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      },
      {
        id: "BANK_CHANNEL",
        name: "\u1368\uff5cbank-of-beautopia",
        lockPermissions: true,
        permissionOverwrites: [
          {
            id: BANKER_BOT_ROLE_ID,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      },
      {
        id: "THE_ARENA_CHANNEL",
        name: "\u0436\uff5cthe-arena",
        lockPermissions: true,
        permissionOverwrites: [
          {
            id: SENSEI_BOT_ROLE_ID,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      },
      {
        id: "THE_ARMORY_CHANNEL",
        name: "\u23e3\uff5cthe-armory",
        lockPermissions: true,
        permissionOverwrites: [
          {
            id: ARMORY_CLERK_BOT_ROLE_ID,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      },
      {
        id: "TRAINING_DOJO_CHANNEL",
        name: "\u2059\uff5ctraining-dojo",
        lockPermissions: true,
        permissionOverwrites: [
          {
            id: SENSEI_BOT_ROLE_ID,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      },
    ],
  },

  // D1
  {
    id: "THE_PROJECTS_D1_CATEGORY",
    name: "The Projects D1",
    permissionOverwrites: [],
    channels: [],
  },

  // D2
  {
    id: "THE_PROJECTS_D2_CATEGORY",
    name: "The Projects D2",
    permissionOverwrites: [],
    channels: [],
  },

  // D3
  {
    id: "THE_PROJECTS_D3_CATEGORY",
    name: "The Projects D3",
    permissionOverwrites: [],
    channels: [],
  },

  // D4
  {
    id: "THE_PROJECTS_D4_CATEGORY",
    name: "The Projects D4",
    permissionOverwrites: [],
    channels: [],
  },

  // D5
  {
    id: "THE_PROJECTS_D5_CATEGORY",
    name: "The Projects D5",
    permissionOverwrites: [],
    channels: [],
  },

  // D6
  {
    id: "THE_PROJECTS_D6_CATEGORY",
    name: "The Projects D6",
    permissionOverwrites: [],
    channels: [],
  },

  // Prison
  {
    id: "PRISON_CATEGORY",
    name: "Prison",
    permissionOverwrites: [
      {
        id: EVERYONE_ROLE_ID,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: WARDEN_BOT_ROLE_ID,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: PRISONER_ROLE_ID,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: PRISONER_BOT_ROLE_ID,
        allow: ["VIEW_CHANNEL"],
      },
    ],
    channels: [
      {
        id: "GEN_POP_CHANNEL",
        name: "\u25a5\uff5cgen-pop",
        lockPermissions: true,
        permissionOverwrites: [],
      },
    ],
  },
];

export default structure;
