import { SlashCommandBuilder } from "@discordjs/builders";
import { Format } from "lib";
import { NPC } from "data/db";
import { RecursivePartial } from "data/types";

const banker: RecursivePartial<NPC> = {
  id: "BANKER",
  name: "Banker Beatrice",
  emoji: { id: "BANKER_NPC" },
  clientOptions: { intents: ["GUILDS"] },
};

banker.commands = [];

banker.commands.push({
  id: "BALANCE",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
    { id: "ADMIN", type: 1, permission: true },
  ],
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription(
      `Your current ${Format.currency(null, { bold: false })} balance`
    )
    .toJSON(),
});

banker.commands.push({
  id: "TRANSFER",
  permissions: [
    { id: "PREGEN", type: 1, permission: true },
    { id: "DEGEN", type: 1, permission: true },
    { id: "ADMIN", type: 1, permission: true },
  ],
  // restrict: async (i, channel, user, recipient) => {
  //   if (!channel.isBank) {
  //     return {
  //       restricted: true,
  //       response: {
  //         content: r(
  //           <>
  //             {userMention(i.user.id)}, come to{" "}
  //             {channelMention(Config.channelId("BANK"))} if you want to transfer{" "}
  //             {Format.token()}.
  //           </>
  //         ),
  //         ephemeral: true,
  //       },
  //     };
  //   }

  //   if (!recipient!.hasAchievement("FINISHED_TRAINER")) {
  //     return {
  //       restricted: true,
  //       response: {
  //         content: r(
  //           <>
  //             {"\u{1f6b7}"} {userMention(recipient!.discordId)} **isn't in the
  //             game**.
  //             <br />
  //             {"\u{1f6b7}"} It looks like you're trying to **CHEAT**, citizen.
  //             <br />
  //             {"\u{1f6b7}"} If we suspect you're not obeying the rules, you will
  //             be **BANNED** and **REMOVED FROM THE WHITELIST**.
  //           </>
  //         ),
  //         ephemeral: true,
  //       },
  //     };
  //   }

  //   if (!user.hasAchievement("FINISHED_TRAINER")) {
  //     return {
  //       restricted: true,
  //       response: {
  //         content: r(
  //           <>
  //             {userMention(i.user.id)}, you need to complete your hacker battle
  //             training before you can `/transfer` $GBT . Go to{" "}
  //             {channelMention(Config.channelId("TRAINING_DOJO"))} and press the
  //             "LFG" button to get started.
  //           </>
  //         ),
  //         ephemeral: true,
  //       },
  //     };
  //   }

  //   return false;
  // },
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
