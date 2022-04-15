import { SlashCommandBuilder } from "@discordjs/builders";
import { plainToInstance } from "class-transformer";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const prisoner: RecursivePartial<NPC> = {
  id: "PRISONER",
  name: "Hugh Donie",
  emoji: { id: "PRISONER_NPC" },
  clientOptions: { intents: ["GUILDS"] },
};

prisoner.commands = [];

prisoner.commands.push({
  id: "ESCAPE",
  permissions: [
    { id: "PRISONER", type: 1, permission: true },
    { id: "ADMIN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("escape")
    .setDescription(`Try and escape while Hugh keeps lookout.`)
    .addStringOption((option) =>
      option
        .setName("code")
        .setRequired(true)
        .setDescription("The door code to escape with.")
    )
    .toJSON(),
});

export default plainToInstance(NPC, prisoner);
