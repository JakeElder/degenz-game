import { SlashCommandBuilder } from "@discordjs/builders";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const martClerk: RecursivePartial<NPC> = {
  id: "MART_CLERK",
  name: "Merris",
  emoji: { id: "MART_CLERK_NPC" },
  clientOptions: { intents: ["GUILDS"] },
};

martClerk.commands = [];

martClerk.commands.push({
  id: "STOCK",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("stock")
    .setDescription(`Find out what's left at Merris Mart.`)
    .toJSON(),
});

martClerk.commands.push({
  id: "BUY",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription(`Buy a thing.`)
    .toJSON(),
});

export default martClerk;
