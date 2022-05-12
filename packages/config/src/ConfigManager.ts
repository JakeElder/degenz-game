import * as dotenv from "dotenv";
import findConfig from "find-config";
import DEV_CONFIG from "./config";
import STAGE_CONFIG from "./config.stage";
import PROD_CONFIG from "./config.prod";
import {
  NPCSymbol,
  EnvVars,
  RoleSymbol,
  GeneralConfig,
  ManagedChannelSymbol,
  EmojiSymbol,
} from "data/types";
import { AppState, Emoji, ManagedChannel, NPC, Role } from "data/db";
import chalk from "chalk";

const NODE_ENV =
  (process.env.NODE_ENV as "development" | "stage" | "production") ||
  "development";

const envFile = {
  development: ".env",
  stage: ".env.stage",
  production: ".env.prod",
}[NODE_ENV];

dotenv.config({ path: findConfig(envFile)! });

if (envFile !== ".env") {
  const colour = chalk.hex("#ffc53d");
  const log = (s: string) => console.log(`  ${s}`);
  console.log("");
  const n = ` NODE_ENV: ${NODE_ENV}   `;
  const l = n.length;
  log(colour("-".repeat(l)));
  log(colour(n));
  log(colour("-".repeat(l)));
  console.log("");
}

const configs = {
  development: DEV_CONFIG,
  stage: STAGE_CONFIG,
  production: PROD_CONFIG,
};

const env = process.env as EnvVars;

export default class ConfigManager {
  static roles: Role[];
  static npcs: NPC[];
  static managedChannels: ManagedChannel[];
  static emojis: Emoji[];
  static appState: AppState | null;

  static async load() {
    [this.roles, this.npcs, this.managedChannels, this.emojis, this.appState] =
      await Promise.all([
        Role.find(),
        NPC.find(),
        ManagedChannel.find(),
        Emoji.find(),
        AppState.findOne({ where: { id: "CURRENT" } }),
      ]);
  }

  static general<T extends keyof GeneralConfig>(k: T): GeneralConfig[T] {
    return configs[NODE_ENV][k];
  }

  static env<T extends keyof EnvVars>(k: T): EnvVars[T] {
    return env[k];
  }

  static emojiCodes(...ids: EmojiSymbol[]) {
    return ids.map((id) => this.emojiCode(id));
  }

  static emojiCode(id: EmojiSymbol) {
    const row = this.emojis.find((r) => r.id === id);

    if (!row) {
      this.notFound("emoji", id);
      throw new Error();
    }

    return row.toString();
  }

  static notFound(entity: string, id: string) {
    const e = new Error(`${id} ${entity} not found`);
    console.error(e.stack);
  }

  static categoryId(k: ManagedChannelSymbol) {
    const row = this.managedChannels.find((r) => r.id === k);

    if (!row) {
      this.notFound("category", k);
      throw new Error();
    }

    if (row.isChannel()) {
      throw new Error(`${k} is not a category`);
    }

    return row.discordChannel.id;
  }

  static channel(id: string) {
    const row = this.managedChannels.find((r) => r.discordChannel.id === id);

    if (!row) {
      this.notFound("channel", id);
      throw new Error();
    }

    return row;
  }

  static channelId(k: ManagedChannelSymbol) {
    const row = this.managedChannels.find((r) => r.id === k);

    if (!row) {
      this.notFound("channel", k);
      throw new Error();
    }

    if (!row.isChannel()) {
      throw new Error(`${k} is not a channel`);
    }

    return row.discordChannel.id;
  }

  static app<T extends keyof AppState>(k: T): AppState[T] {
    if (!this.appState) {
      throw new Error("No app state loaded.");
    }
    return this.appState[k];
  }

  static roleId(k: RoleSymbol) {
    const row = this.roles.find((r) => r.id === k);

    if (!row) {
      this.notFound("role", k);
      throw new Error();
    }

    return row.discordId;
  }

  static reverseRoleId = (id: string) => {
    const row = this.roles.find((r) => r.discordId === id);

    if (!row) {
      this.notFound("role", id);
      throw new Error();
    }

    return row.id;
  };

  static clientId(k: NPCSymbol) {
    const row = this.npcs.find((r) => r.id === k);

    if (!row) {
      this.notFound("npc", k);
      throw new Error();
    }

    return row.clientId;
  }

  static botToken(k: NPCSymbol) {
    return env[`${k}_BOT_TOKEN`];
  }

  static reverseClientId = (id: string) => {
    const row = this.npcs.find((r) => r.clientId === id);

    if (!row) {
      this.notFound("npc", id);
      throw new Error();
    }

    return row.id;
  };
}
