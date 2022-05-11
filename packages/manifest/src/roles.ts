import { plainToInstance } from "class-transformer";
import { Role } from "data/db";
import { RecursivePartial } from "data/types";
import { Permissions } from "discord.js";

const EVERYONE = new Permissions([
  "VIEW_CHANNEL",
  "CHANGE_NICKNAME",
  "SEND_MESSAGES",
  "ADD_REACTIONS",
  "USE_EXTERNAL_EMOJIS",
  "USE_EXTERNAL_STICKERS",
  "READ_MESSAGE_HISTORY",
  "USE_APPLICATION_COMMANDS",
]);

const BASE = new Permissions([
  "SEND_MESSAGES_IN_THREADS",
  "EMBED_LINKS",
  "ATTACH_FILES",
]);

const ESTABLISHMENT = new Permissions([
  ...BASE.toArray(),
  "CREATE_PUBLIC_THREADS",
  "CREATE_PRIVATE_THREADS",
  "MENTION_EVERYONE",
]);

const r: RecursivePartial<Role>[] = [
  {
    id: "EVERYONE",
    type: "EVERYONE",
    permissions: EVERYONE,
  },
  {
    type: "SUPPLEMENTARY",
    id: "ADMIN",
    name: "Admin",
    permissions: new Permissions(["ADMINISTRATOR"]),
    emoji: { id: "BLUE_TICK" },
  },
  {
    type: "MANAGED",
    id: "ADMIN_BOT",
    permissions: new Permissions(["ADMINISTRATOR"]),
  },
  {
    type: "BASE",
    id: "PRISONER",
    name: "Prisoner",
    permissions: BASE,
  },
  {
    type: "BASE",
    id: "DEGEN",
    name: "Degen",
    permissions: BASE,
  },
  {
    id: "VERIFIED",
    type: "BASE",
    name: "Verified",
    permissions: BASE,
  },
  {
    id: "HIGH_COMMAND",
    type: "SUPPLEMENTARY",
    name: "High Command",
    color: "#e400ff",
    emoji: { id: "MEDAL" },
  },
  {
    type: "BASE",
    id: "ESTABLISHMENT",
    name: "Establishment",
    permissions: ESTABLISHMENT,
    emoji: { id: "RED_TICK" },
  },
  {
    id: "MODS",
    type: "SUPPLEMENTARY",
    name: "Mods",
  },
  {
    id: "BIG_BROTHER_BOT",
    type: "MANAGED",
    emoji: { id: "BIG_BROTHER_NPC" },
    permissions: new Permissions([
      "CREATE_PUBLIC_THREADS",
      "CREATE_PRIVATE_THREADS",
    ]),
  },
  { id: "SENSEI_BOT", type: "MANAGED", emoji: { id: "SENSEI_NPC" } },
  {
    id: "ALLY_BOT",
    type: "MANAGED",
    emoji: { id: "ALLY_NPC" },
  },
  {
    id: "DEVILS_ADVOCATE_BOT",
    type: "MANAGED",
    emoji: { id: "DEVILS_ADVOCATE_NPC" },
  },
  {
    id: "WARDEN_BOT",
    type: "MANAGED",
    emoji: { id: "WARDEN_NPC" },
  },
  { id: "TOSSER_BOT", type: "MANAGED", emoji: { id: "TOSSER_NPC" } },
  { id: "BANKER_BOT", type: "MANAGED", emoji: { id: "BANKER_NPC" } },
  { id: "MART_CLERK_BOT", type: "MANAGED", emoji: { id: "MART_CLERK_NPC" } },
  { id: "PRISONER_BOT", type: "MANAGED", emoji: { id: "PRISONER_NPC" } },
  {
    id: "ARMORY_CLERK_BOT",
    type: "MANAGED",
    emoji: { id: "ARMORY_CLERK_NPC" },
  },
  {
    type: "SUPPLEMENTARY",
    id: "THOUGHT_POLICE",
    name: "Thought Police",
    emoji: { id: "THOUGHT_POLICE" },
  },
  {
    id: "D1_CITIZEN",
    type: "CITIZEN",
    name: "D1 Citizen",
    color: "#edb500",
    emoji: { id: "D1" },
  },
  {
    id: "VIP",
    type: "SUPPLEMENTARY",
    name: "VIP",
    color: "#cf8d05",
    emoji: { id: "CROWN" },
  },
  {
    id: "ENGAGEMENT_LEVEL_10",
    type: "SUPPLEMENTARY",
    name: "Lvl 10 :: Tiger Blood",
    color: "#ff6900",
    emoji: { id: "TIGER_BLOOD" },
  },
  {
    id: "ENGAGEMENT_LEVEL_8",
    type: "SUPPLEMENTARY",
    name: "Lvl 8 :: Bullish",
    color: "#00e3ff",
    emoji: { id: "BULLISH" },
  },
  {
    id: "ENGAGEMENT_LEVEL_6",
    type: "SUPPLEMENTARY",
    name: "Lvl 6 :: Cock",
    color: "#795752",
    emoji: { id: "CHICKEN" },
  },
  {
    id: "ENGAGEMENT_LEVEL_4",
    type: "SUPPLEMENTARY",
    name: "Lvl 4 :: Sunshine",
    color: "#ffd141",
    emoji: { id: "SUNSHINE" },
  },
  {
    id: "ENGAGEMENT_LEVEL_2",
    type: "SUPPLEMENTARY",
    name: "Lvl 2 :: Cupcake",
    color: "#fcb0ff",
    emoji: { id: "CUPCAKE" },
  },
  {
    type: "BASE",
    id: "PREGEN",
    name: "Pregen",
    permissions: BASE,
    emoji: { id: "BABY" },
  },
  {
    type: "CITIZEN",
    id: "D2_CITIZEN",
    name: "D2 Citizen",
    color: "#9b65e3",
    emoji: { id: "D2" },
  },
  {
    type: "CITIZEN",
    id: "D3_CITIZEN",
    name: "D3 Citizen",
    color: "#9b65e3",
    emoji: { id: "D3" },
  },
  {
    type: "CITIZEN",
    id: "D4_CITIZEN",
    name: "D4 Citizen",
    color: "#9b65e3",
    emoji: { id: "D4" },
  },
  {
    type: "CITIZEN",
    id: "D5_CITIZEN",
    name: "D5 Citizen",
    color: "#9b65e3",
    emoji: { id: "D5" },
  },
  {
    type: "CITIZEN",
    id: "D6_CITIZEN",
    name: "D6 Citizen",
    color: "#9b65e3",
    emoji: { id: "D6" },
  },
  {
    type: "CITIZEN",
    id: "BULLSEYE_CITIZEN",
    name: "Bullseye Citizen",
    color: "#379de6",
    emoji: { id: "BULLSEYE" },
  },
  {
    type: "CITIZEN",
    id: "THE_GRID_CITIZEN",
    name: "The Grid Citizen",
    color: "#379de6",
    emoji: { id: "THE_GRID" },
  },
  {
    type: "CITIZEN",
    id: "THE_LEFT_CITIZEN",
    name: "The Left Citizen",
    color: "#379de6",
    emoji: { id: "THE_LEFT" },
  },
  {
    type: "CITIZEN",
    id: "THE_RIGHT_CITIZEN",
    name: "The Right Citizen",
    color: "#379de6",
    emoji: { id: "THE_RIGHT" },
  },
  {
    type: "CITIZEN",
    id: "VULTURE_CITIZEN",
    name: "Vulture Citizen",
    color: "#379de6",
    emoji: { id: "VULTURE" },
  },
  {
    type: "SUPPLEMENTARY",
    id: "TRAINEE",
    name: "Trainee",
  },
  {
    type: "SUPPLEMENTARY",
    id: "HACKER",
    name: "Hacker",
  },
  {
    type: "SUPPLEMENTARY",
    id: "WHITELIST",
    name: "Whitelist",
  },
];

export const roles = plainToInstance(Role, r);
