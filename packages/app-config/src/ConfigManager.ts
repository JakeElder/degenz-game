import DEV_CONFIG from "./config";
import STAGE_CONFIG from "./config.stage";
import PROD_CONFIG from "./config.prod";
import { BotId, CategoryId, ChannelId, EnvVars, RoleId } from "types";

export const NODE_ENV =
  (process.env.NODE_ENV as "development" | "stage" | "production") ||
  "development";

const configs = {
  development: DEV_CONFIG,
  stage: STAGE_CONFIG,
  production: PROD_CONFIG,
};

const config = configs[NODE_ENV];

const env = process.env as EnvVars;

const BOT_TOKENS: Record<BotId, string> = {
  WARDEN: env.WARDEN_BOT_TOKEN,
  TOSSER: env.TOSSER_BOT_TOKEN,
  SENSEI: env.SENSEI_BOT_TOKEN,
  PRISONER: env.PRISONER_BOT_TOKEN,
  ADMIN: env.ADMIN_BOT_TOKEN,
  ALLY: env.ALLY_BOT_TOKEN,
  BANKER: env.BANKER_BOT_TOKEN,
  BIG_BROTHER: env.BIG_BROTHER_BOT_TOKEN,
  MART_CLERK: env.MART_CLERK_BOT_TOKEN,
  ARMORY_CLERK: env.ARMORY_CLERK_BOT_TOKEN,
};

const ENV = {
  MIXPANEL_PROJECT_TOKEN: env.MIXPANEL_PROJECT_TOKEN,
  MONGO_URI: env.MONGO_URI,
  ROLLBAR_TOKEN: env.ROLLBAR_TOKEN,
};

export default class ConfigManager {
  static general<T extends keyof typeof config.GENERAL>(
    k: T
  ): typeof config.GENERAL[T] {
    return config.GENERAL[k];
  }

  static env<T extends keyof typeof ENV>(k: T): typeof ENV[T] {
    return ENV[k];
  }

  static categoryId = (k: CategoryId) => config.CATEGORY_IDS[k];
  static channelId = (k: ChannelId) => config.CHANNEL_IDS[k];
  static roleId = (k: RoleId) => config.ROLE_IDS[k];
  static clientId = (k: BotId) => config.CLIENT_IDS[k];
  static botToken = (k: BotId) => BOT_TOKENS[k];

  static clientIds = () => config.CLIENT_IDS;

  static reverseClientId = (id: string) => {
    for (const [key, value] of Object.entries(config.CLIENT_IDS)) {
      if (value === id) {
        return key;
      }
    }
  };
}
