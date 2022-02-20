import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "types";
import { Intents } from "discord.js";
import Config from "app-config";
import { Format } from "lib";

const { FLAGS } = Intents;

const banker: Bot = {
  symbol: "BANKER",
  name: "Banker Beatrice",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `stock` command
banker.commands.push({
  symbol: "BALANCE",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription(
      `Your current ${Format.currency(null, { bold: false })} balance`
    )
    .toJSON(),
});

// `transfer` command
banker.commands.push({
  symbol: "TRANSFER",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription(
      `Transfer ${Format.currency(null, {
        bold: false,
      })} to a fellow citizen`
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setRequired(true)
        .setDescription(
          `The amount of ${Format.currency(null, { bold: false })} to transfer.`
        )
    )
    .addUserOption((option) =>
      option
        .setName("recipient")
        .setRequired(true)
        .setDescription("Select a recipient")
    )
    .toJSON(),
});

export default banker;
