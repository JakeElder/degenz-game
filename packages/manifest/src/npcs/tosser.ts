import { SlashCommandBuilder } from "@discordjs/builders";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";
import { Format } from "lib";

const tosser: RecursivePartial<NPC> = {
  id: "TOSSER",
  name: "Tosser Ted",
  emoji: { id: "TOSSER_NPC" },
  clientOptions: { intents: ["GUILDS"] },
};

tosser.commands = [];

tosser.commands.push({
  id: "TOSS",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("toss")
    .setDescription(
      `Gamble your ${Format.currency(null, { bold: false })} on a coin flip.`
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setRequired(true)
        .setDescription(
          `The amount of ${Format.currency(null, { bold: false })} to bet.`
        )
    )
    .addUserOption((option) =>
      option
        .setName("opponent")
        .setRequired(false)
        .setDescription("Who are you tossing with?")
    )
    .toJSON(),
});

export default tosser;
