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
import chalk from "chalk";

const envFile = process.env.ENV_FILE || ".env";
dotenv.config({ path: findConfig(envFile)! });

const NODE_ENV =
  (process.env.NODE_ENV as "development" | "stage" | "production") ||
  "development";

if (envFile !== ".env") {
  const colour = chalk.hex("#ffc53d");
  const log = (s: string) => console.log(`  ${s}`);
  console.log("");
  const e = ` ENV_FILE: ${envFile}   `;
  const n = ` NODE_ENV: ${NODE_ENV}   `;
  const l = Math.max(e.length, n.length);
  log(colour("-".repeat(l)));
  log(colour(e));
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

const BOT_TOKENS: Record<BotSymbol, string> = {
  ADMIN: env.ADMIN_BOT_TOKEN,
  ALLY: env.ALLY_BOT_TOKEN,
  ARMORY_CLERK: env.ARMORY_CLERK_BOT_TOKEN,
  BANKER: env.BANKER_BOT_TOKEN,
  BIG_BROTHER: env.BIG_BROTHER_BOT_TOKEN,
  DEVILS_ADVOCATE: env.DEVILS_ADVOCATE_BOT_TOKEN,
  MART_CLERK: env.MART_CLERK_BOT_TOKEN,
  PRISONER: env.PRISONER_BOT_TOKEN,
  SENSEI: env.SENSEI_BOT_TOKEN,
  TOSSER: env.TOSSER_BOT_TOKEN,
  WARDEN: env.WARDEN_BOT_TOKEN,
};

const ENV = {
  CA_CERT: env.CA_CERT,
  DATABASE_URL: env.DATABASE_URL,
  MIXPANEL_PROJECT_TOKEN: env.MIXPANEL_PROJECT_TOKEN,
  NODE_ENV,
  WEB_URL: env.WEB_URL,
  ROLLBAR_TOKEN: env.ROLLBAR_TOKEN,
};

export default class ConfigManager {
  static general<T extends keyof typeof configs["development"]["GENERAL"]>(
    k: T,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ): typeof configs["development"]["GENERAL"][T] {
    return configs[env].GENERAL[k];
  }

  static env<T extends keyof typeof ENV>(k: T): typeof ENV[T] {
    return ENV[k];
  }

  static categoryId(
    k: CategorySymbol,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ) {
    return configs[env].CATEGORY_IDS[k];
  }

  static channelId(
    k: ChannelSymbol,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ) {
    return configs[env].CHANNEL_IDS[k];
  }

  static roleId(
    k: RoleSymbol,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ) {
    return configs[env].ROLE_IDS[k];
  }

  static reverseRoleId = (
    id: string,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ) => {
    for (const [key, value] of Object.entries(configs[env].ROLE_IDS)) {
      if (value === id) {
        return key as RoleSymbol;
      }
    }
  };

  static clientId(
    k: BotSymbol,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ) {
    return configs[env].CLIENT_IDS[k];
  }

  static botToken(k: BotSymbol) {
    return BOT_TOKENS[k];
  }

  static clientIds({ env }: { env: keyof typeof configs } = { env: NODE_ENV }) {
    return configs[env].CLIENT_IDS;
  }

  static reverseClientId = (
    id: string,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ) => {
    for (const [key, value] of Object.entries(configs[env].CLIENT_IDS)) {
      if (value === id) {
        return key as BotSymbol;
      }
    }
  };
}
