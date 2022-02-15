import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "types";
import { Intents } from "discord.js";
import Config from "app-config";
import { Format } from "lib";

const { FLAGS } = Intents;

const admin: Bot = {
  id: "TOSSER",
  name: "Tosser Ted",
  clientOptions: { intents: [FLAGS.GUILDS] },
  commands: [],
};

// `toss` command
admin.commands.push({
  id: "TOSS",
  permissions: [
    { id: Config.roleId("DEGEN"), type: 1, permission: true },
    { id: Config.roleId("ADMIN"), type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("toss")
    .setDescription(
      `Gamble your ${Format.currency({ bold: false })} on a coin flip.`
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setRequired(true)
        .setDescription(
          `The amount of ${Format.currency({ bold: false })} to bet.`
        )
    )
    .addUserOption((option) =>
      option
        .setName("opponent")
        .setRequired(true)
        .setDescription("Who are you tossing with?")
    )
    .toJSON(),
});

export default admin;
