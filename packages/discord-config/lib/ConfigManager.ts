import DEV_CONFIG from "../config";
import STAGE_CONFIG from "../config.stage";
import PROD_CONFIG from "../config.prod";

export const NODE_ENV =
  (process.env.NODE_ENV as "development" | "stage" | "production") ||
  "development";

const config = {
  development: DEV_CONFIG,
  stage: STAGE_CONFIG,
  production: PROD_CONFIG,
}[NODE_ENV];

class Config {
  static get(k: keyof typeof config) {
    if (k in config) {
      return config[k];
    }
    throw new Error(`Unset config var: "${k}"`);
  }
}

export default Config;
