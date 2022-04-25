import { Role } from "data/db";
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

export const roles = Role.create([
  {
    id: "EVERYONE",
    type: "EVERYONE",
    permissions: EVERYONE,
  },
  {
    id: "VERIFIED",
    type: "BASE",
    name: "Verified",
    permissions: BASE,
  },
  {
    type: "BASE",
    id: "PREGEN",
    name: "Pregen",
    permissions: BASE,
    emoji: { id: "BABY" },
  },
  {
    type: "BASE",
    id: "DEGEN",
    name: "Degen",
    permissions: BASE,
  },
  {
    type: "BASE",
    id: "PRISONER",
    name: "Prisoner",
    permissions: BASE,
  },
  {
    type: "BASE",
    id: "ESTABLISHMENT",
    name: "Establishment",
    permissions: ESTABLISHMENT,
    emoji: { id: "RED_TICK" },
  },
  {
    type: "MANAGED",
    id: "ADMIN_BOT",
    permissions: new Permissions(["ADMINISTRATOR"]),
  },
  { id: "BIG_BROTHER_BOT", type: "MANAGED" },
  { id: "DEVILS_ADVOCATE_BOT", type: "MANAGED" },
  { id: "ALLY_BOT", type: "MANAGED" },
  { id: "WARDEN_BOT", type: "MANAGED" },
  { id: "TOSSER_BOT", type: "MANAGED" },
  { id: "BANKER_BOT", type: "MANAGED" },
  { id: "MART_CLERK_BOT", type: "MANAGED" },
  { id: "PRISONER_BOT", type: "MANAGED" },
  { id: "ARMORY_CLERK_BOT", type: "MANAGED" },
  { id: "SENSEI_BOT", type: "MANAGED" },
  {
    type: "CITIZEN",
    id: "D1_CITIZEN",
    name: "D1 Citizen",
    color: "#edb500",
    emoji: { id: "D1" },
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
  {
    type: "SUPPLEMENTARY",
    id: "THOUGHT_POLICE",
    name: "Thought Police",
    emoji: { id: "THOUGHT_POLICE" },
  },
  {
    type: "SUPPLEMENTARY",
    id: "ADMIN",
    name: "Admin",
    permissions: new Permissions(["ADMINISTRATOR"]),
    emoji: { id: "BLUE_TICK" },
  },
]);
