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
import fs from "fs";

type Env = "development" | "stage" | "production";

const envs: Record<Env, EnvVars> = {
  development: dotenv.parse(fs.readFileSync(findConfig(".env")!)) as EnvVars,
  stage: dotenv.parse(fs.readFileSync(findConfig(".env.stage")!)) as EnvVars,
  production: dotenv.parse(
    fs.readFileSync(findConfig(".env.prod")!)
  ) as EnvVars,
};

const NODE_ENV = (process.env.NODE_ENV as Env | undefined) || "development";

if (NODE_ENV !== "development") {
  const colour = chalk.hex("#ffc53d");
  const log = (s: string) => console.log(`  ${s}`);
  process.stdout.write("\n");
  const n = ` NODE_ENV: ${NODE_ENV}   `;
  const l = n.length;
  log(colour("-".repeat(l)));
  log(colour(n));
  log(colour("-".repeat(l)));
  process.stdout.write("\n");
}

const configs = {
  development: DEV_CONFIG,
  stage: STAGE_CONFIG,
  production: PROD_CONFIG,
};

export default class ConfigManager {
  static roles: Role[];

  static async load() {
    this.roles = await Role.find();
  }

  static general<T extends keyof typeof configs["development"]["GENERAL"]>(
    k: T,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ): typeof configs["development"]["GENERAL"][T] {
    return configs[env].GENERAL[k];
  }

  static env<T extends keyof EnvVars>(
    k: T,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ): EnvVars[T] {
    return envs[env][k];
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
    return role.symbol;
  };

  static clientId(
    k: BotSymbol,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ) {
    return configs[env].CLIENT_IDS[k];
  }

  static botToken(
    k: BotSymbol,
    { env }: { env: keyof typeof configs } = { env: NODE_ENV }
  ) {
    return envs[env][`${k}_BOT_TOKEN`];
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
