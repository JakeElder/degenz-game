import { SlashCommandBuilder } from "@discordjs/builders";
import { plainToInstance } from "class-transformer";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const martClerk: RecursivePartial<NPC> = {
  id: "MART_CLERK",
  name: "Merris",
  emoji: { id: "MART_CLERK_NPC" },
  clientOptions: { intents: ["GUILDS"] },
};

martClerk.commands = [];

// const restrictToMart: Bot["commands"][0]["restrict"] = async (i, channel) => {
//   if (channel.isMart) {
//     return false;
//   }
//   return {
//     restricted: true,
//     response: {
//       content: r(
//         <>
//           {userMention(i.user.id)}, come to{" "}
//           {channelMention(Config.channelId("MART"))} if you want to buy stuff.
//         </>
//       ),
//       ephemeral: true,
//     },
//   };
// };

martClerk.commands.push({
  id: "STOCK",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
  ],
  // restrict: restrictToMart,
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
  // restrict: restrictToMart,
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription(`Buy a thing.`)
    .toJSON(),
});

export default plainToInstance(NPC, martClerk);
