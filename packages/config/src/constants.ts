import { OverwriteResolvable } from "discord.js";
import Config from ".";

export const READ_ONLY: OverwriteResolvable[] = [
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

export const READ_ONLY_BEAUTOPIA: OverwriteResolvable[] = [
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
    id: Config.roleId("PRISONER"),
    deny: ["VIEW_CHANNEL"],
  },
  {
    id: Config.roleId("BIG_BROTHER_BOT"),
    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
  },
];
