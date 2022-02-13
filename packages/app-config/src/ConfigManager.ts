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

export const {
  ADMIN_BOT_TOKEN,
  ALLY_BOT_TOKEN,
  BANKER_BOT_TOKEN,
  BIG_BROTHER_TOKEN,
  MART_CLERK_BOT_TOKEN,
  MIXPANEL_PROJECT_TOKEN,
  MONGO_URI,
  PRISONER_BOT_TOKEN,
  TOSSER_BOT_TOKEN,
  WARDEN_BOT_TOKEN,
  ROLLBAR_TOKEN,
} = process.env as EnvVars;

export default class ConfigManager {
  static general<T extends keyof typeof config.GENERAL>(
    k: T
  ): typeof config.GENERAL[T] {
    return config.GENERAL[k];
  }

  static categoryId(k: CategoryId) {
    return config.CATEGORY_IDS[k];
  }

  static channelId(k: ChannelId) {
    return config.CHANNEL_IDS[k];
  }

  static roleId(k: RoleId) {
    return config.ROLE_IDS[k];
  }

  static clientId(k: BotId) {
    return config.CLIENT_IDS[k];
  }
}
