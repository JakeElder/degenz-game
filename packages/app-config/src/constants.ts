import { OverwriteResolvable } from "discord.js";
import Config from ".";

export const READ_ONLY: OverwriteResolvable[] = [
  {
    id: Config.get("EVERYONE_ROLE_ID"),
    deny: [
      "VIEW_CHANNEL",
      "SEND_MESSAGES",
      "CREATE_PUBLIC_THREADS",
      "CREATE_PRIVATE_THREADS",
    ],
  },
  {
    id: Config.get("DEGEN_ROLE_ID"),
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: Config.get("VERIFIED_ROLE_ID"),
    allow: ["VIEW_CHANNEL"],
  },
  {
    id: Config.get("PRISONER_ROLE_ID"),
    deny: ["VIEW_CHANNEL"],
  },
  {
    id: Config.get("BIG_BROTHER_BOT_ROLE_ID"),
    allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
  },
];
