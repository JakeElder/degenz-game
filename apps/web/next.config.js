const findConfig = require("find-config");
const dotenv = require("dotenv");

const withTM = require("next-transpile-modules")(
  ["config", "manifest", "data", "lib"],
  { resolveSymlinks: false }
);

const ENV = process.env.APP_ENV || "development";

const envFile = {
  development: ".env",
  stage: ".env.stage",
  production: ".env.prod",
}[ENV];

dotenv.config({ path: findConfig(envFile) });

const nextConfig = {
  reactStrictMode: true,
  env: {
    GUILD_ID: process.env.GUILD_ID,
    REDIRECT_URI: "http://localhost:7788",
  },
};

module.exports = withTM(nextConfig);
