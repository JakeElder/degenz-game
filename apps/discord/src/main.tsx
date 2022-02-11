import cleanup from "node-cleanup";
import PrettyError from "pretty-error";
import { Client, ClientOptions, Intents } from "discord.js";
import { structure } from "discord-config";
import { Category } from "types";

const { FLAGS } = Intents;
const pe = new PrettyError();

process.on("uncaughtException", (e) => {
  // rollbar.error(e);
  console.error("Uncaught Exception", pe.render(e));
});

process.on("unhandledRejection", (e: Error) => {
  // rollbar.error(e);
  console.error("Unhandled Rejection", pe.render(e));
});

const TOKEN = "OTM2ODMzNDE5MDYzNzM4NDI4.YfS8HA.5e_mF9RYQzehN9pFs-XwsN7XQrY";

const clientOptions: ClientOptions = {
  intents: [FLAGS.GUILDS, FLAGS.GUILD_MEMBERS, FLAGS.GUILD_MESSAGES],
};

const client = new Client(clientOptions);

client.once("ready", async () => {
  console.log("ready");
});

client.login(TOKEN);

cleanup(() => {
  console.log("Running cleanup");
});
