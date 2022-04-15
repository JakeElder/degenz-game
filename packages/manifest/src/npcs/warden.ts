import { SlashCommandBuilder } from "@discordjs/builders";
import { plainToInstance } from "class-transformer";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const warden: RecursivePartial<NPC> = {
  id: "WARDEN",
  name: "Walden",
  emoji: { id: "WARDEN_NPC" },
  clientOptions: { intents: ["GUILDS"] },
};

warden.commands = [];

warden.commands.push({
  id: "BRIBE",
  permissions: [
    { id: "PRISONER", type: 1, permission: true },
    { id: "ADMIN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("bribe")
    .setDescription(
      `Bribe Walden. Maybe if it's enough he'll give you the door code.`
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setRequired(true)
        .setDescription("The amount to bribe with")
    )
    .toJSON(),
});

warden.commands.push({
  id: "IMPRISON",
  permissions: [
    { id: "THOUGHT_POLICE", type: 1, permission: true },
    { id: "ADMIN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("imprison")
    .setDescription(`Imprison a member.`)
    .addUserOption((option) =>
      option
        .setName("member")
        .setRequired(true)
        .setDescription("The member to imprison")
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setRequired(true)
        .setDescription("The reason for imprisonment.")
    )
    .toJSON(),
});

warden.commands.push({
  id: "RELEASE",
  permissions: [
    { id: "THOUGHT_POLICE", type: 1, permission: true },
    { id: "ADMIN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("release")
    .setDescription(`Release a prisoner`)
    .addUserOption((option) =>
      option
        .setName("member")
        .setRequired(true)
        .setDescription("The member to release")
    )
    .toJSON(),
});

export default plainToInstance(NPC, warden);
