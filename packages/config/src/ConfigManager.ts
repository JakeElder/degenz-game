import * as dotenv from "dotenv";
import findConfig from "find-config";
import DEV_CONFIG from "./config";
import STAGE_CONFIG from "./config.stage";
import PROD_CONFIG from "./config.prod";
import {
  BotSymbol,
  CategorySymbol,
  ChannelSymbol,
  EnvVars,
  RoleSymbol,
} from "data/types";
import { Role } from "data/db";
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

  static async load() {
    this.roles = await Role.find();
  }

  static general<T extends keyof typeof configs["development"]["GENERAL"]>(
    k: T
  ): typeof configs["development"]["GENERAL"][T] {
    return configs[NODE_ENV].GENERAL[k];
  }

  static env<T extends keyof EnvVars>(k: T): EnvVars[T] {
    return env[k];
  }

  static categoryId(k: CategorySymbol) {
    return configs[NODE_ENV].CATEGORY_IDS[k];
  }

  static channelId(k: ChannelSymbol) {
    return configs[NODE_ENV].CHANNEL_IDS[k];
  }

  static roleId(k: RoleSymbol) {
    const role = this.roles.find((r) => r.symbol === k);
    if (!role) {
      const e = new Error(`${k} role not found`);
      console.log(e.stack);
      throw e;
    }
    return role.discordId;
  }

  static reverseRoleId = (id: string) => {
    const role = this.roles.find((r) => r.discordId === id);
    if (!role) {
      throw new Error(`${id} role not found`);
    }
    return role.discordId;
  };

  static clientId(k: BotSymbol) {
    return configs[NODE_ENV].CLIENT_IDS[k];
  }

  static botToken(k: BotSymbol) {
    return env[`${k}_BOT_TOKEN`];
  }

  static clientIds() {
    return configs[NODE_ENV].CLIENT_IDS;
  }

  static reverseClientId = (id: string) => {
    for (const [key, value] of Object.entries(configs[NODE_ENV].CLIENT_IDS)) {
      if (value === id) {
        return key as BotSymbol;
      }
    }
  };
}
