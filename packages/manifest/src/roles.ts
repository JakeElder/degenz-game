import { Role } from "data/types";
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

// (+)

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

const roles: Role[] = [
  {
    type: "EVERYONE",
    symbol: "EVERYONE",
    permissions: EVERYONE.bitfield.toString(),
  },
  {
    type: "BASE",
    symbol: "VERIFIED",
    name: "Verified",
    permissions: BASE.bitfield.toString(),
  },
  {
    type: "BASE",
    symbol: "DEGEN",
    name: "Degen",
    permissions: BASE.bitfield.toString(),
  },
  {
    type: "BASE",
    symbol: "PRISONER",
    name: "Prisoner",
    permissions: BASE.bitfield.toString(),
  },
  {
    type: "BASE",
    symbol: "ESTABLISHMENT",
    name: "Establishment",
    permissions: ESTABLISHMENT.bitfield.toString(),
  },
  {
    type: "MANAGED",
    symbol: "ADMIN_BOT",
    permissions: new Permissions(["ADMINISTRATOR"]).bitfield.toString(),
  },
  { type: "MANAGED", symbol: "BIG_BROTHER_BOT" },
  { type: "MANAGED", symbol: "DEVILS_ADVOCATE_BOT" },
  { type: "MANAGED", symbol: "ALLY_BOT" },
  { type: "MANAGED", symbol: "WARDEN_BOT" },
  { type: "MANAGED", symbol: "TOSSER_BOT" },
  { type: "MANAGED", symbol: "BANKER_BOT" },
  { type: "MANAGED", symbol: "MART_CLERK_BOT" },
  { type: "MANAGED", symbol: "PRISONER_BOT" },
  { type: "MANAGED", symbol: "ARMORY_CLERK_BOT" },
  { type: "MANAGED", symbol: "SENSEI_BOT" },
  {
    type: "CITIZEN",
    symbol: "D1_CITIZEN",
    name: "D1 Citizen",
    color: "#edb500",
  },
  {
    type: "CITIZEN",
    symbol: "D2_CITIZEN",
    name: "D2 Citizen",
    color: "#9b65e3",
  },
  {
    type: "CITIZEN",
    symbol: "D3_CITIZEN",
    name: "D3 Citizen",
    color: "#9b65e3",
  },
  {
    type: "CITIZEN",
    symbol: "D4_CITIZEN",
    name: "D4 Citizen",
    color: "#9b65e3",
  },
  {
    type: "CITIZEN",
    symbol: "D5_CITIZEN",
    name: "D5 Citizen",
    color: "#9b65e3",
  },
  {
    type: "CITIZEN",
    symbol: "D6_CITIZEN",
    name: "D6 Citizen",
    color: "#9b65e3",
  },
  {
    type: "CITIZEN",
    symbol: "BULLSEYE_CITIZEN",
    name: "Bullseye Citizen",
    color: "#379de6",
  },
  {
    type: "CITIZEN",
    symbol: "THE_GRID_CITIZEN",
    name: "The Grid Citizen",
    color: "#379de6",
  },
  {
    type: "CITIZEN",
    symbol: "THE_LEFT_CITIZEN",
    name: "The Left Citizen",
    color: "#379de6",
  },
  {
    type: "CITIZEN",
    symbol: "THE_RIGHT_CITIZEN",
    name: "The Right Citizen",
    color: "#379de6",
  },
  {
    type: "CITIZEN",
    symbol: "VULTURE_CITIZEN",
    name: "Vulture Citizen",
    color: "#379de6",
  },
  {
    type: "SUPPLEMENTARY",
    symbol: "TRAINEE",
    name: "Trainee",
  },
  {
    type: "SUPPLEMENTARY",
    symbol: "THOUGHT_POLICE",
    name: "Thought Police",
  },
  {
    type: "SUPPLEMENTARY",
    symbol: "ADMIN",
    name: "Admin",
    permissions: new Permissions(["ADMINISTRATOR"]).bitfield.toString(),
  },
];

export default roles;
