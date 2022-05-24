import { SlashCommandBuilder } from "@discordjs/builders";
import { NPC } from "data/db";
import {
  AchievementSymbol,
  DistrictSymbol,
  RecursivePartial,
} from "data/types";
import { Format } from "lib";
import { achievements } from "../achievements";

const districtChoices: [string, DistrictSymbol][] = [
  ["District 1", "D1"],
  ["District 2", "D2"],
  ["District 3", "D3"],
  ["District 4", "D4"],
  ["District 5", "D5"],
  ["District 6", "D6"],
];

const achievementChoices: [string, AchievementSymbol][] = achievements.map(
  (a) => [a.id!, a.id!]
);

const admin: RecursivePartial<NPC> = {
  id: "ADMIN",
  name: "Degenz Admin",
  clientOptions: {
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_MESSAGES",
      "GUILD_PRESENCES",
      "GUILD_INVITES",
      "GUILD_MESSAGE_REACTIONS",
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
  },
};

admin.commands = [
  {
    id: "ADMIN",
    permissions: [
      { id: "ADMIN", type: 1, permission: true },
      { id: "HIGH_COMMAND", type: 1, permission: true },
    ],
    data: new SlashCommandBuilder()
      .setName("admin")
      .setDescription(`Find out about ${Format.worldName()} and it's citizens`)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("initiate")
          .setDescription(`Enter a user in to the game`)
          .addUserOption((option) =>
            option
              .setName("member")
              .setRequired(true)
              .setDescription("The user to initiate")
          )
          .addStringOption((option) =>
            option
              .setName("district")
              .setRequired(true)
              .setChoices(districtChoices)
              .setDescription(`The district to assign an apartment`)
          )
          .addBooleanOption((option) =>
            option.setName("onboard").setDescription("Onboard or skip to game")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("eject")
          .setDescription(`Remove a user from the game, deleting all stats`)
          .addUserOption((option) =>
            option
              .setName("member")
              .setRequired(true)
              .setDescription("The user to eject")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("clear")
          .setDescription(`Clear a channels messages`)
          .addChannelOption((option) =>
            option.setName("channel").setDescription("The channel to clear")
          )
          .addNumberOption((option) =>
            option
              .setName("number")
              .setDescription("The number of message to clear")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("send")
          .setDescription(`Send a message from a bot`)
          .addStringOption((option) =>
            option
              .setName("message")
              .setRequired(true)
              .setDescription("The message to send")
          )
          .addUserOption((option) =>
            option
              .setName("as")
              .setRequired(true)
              .setDescription("The bot to have send the message")
          )
          .addChannelOption((option) =>
            option.setName("channel").setDescription("The channel to message")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("issue")
          .setDescription(`Issue ${Format.currency(null, { bold: false })}`)
          .addNumberOption((option) =>
            option
              .setName("amount")
              .setRequired(true)
              .setDescription(
                `The amount of ${Format.currency(null, { bold: false })} send`
              )
          )
          .addUserOption((option) =>
            option
              .setName("member")
              .setDescription("The member to issue GBT to.")
              .setRequired(false)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("confiscate")
          .setDescription(
            `Confiscate ${Format.currency(null, { bold: false })}`
          )
          .addNumberOption((option) =>
            option
              .setName("amount")
              .setRequired(true)
              .setDescription(
                `The amount of ${Format.currency(null, { bold: false })} send`
              )
          )
          .addUserOption((option) =>
            option
              .setName("member")
              .setDescription("The member to issue GBT to.")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("open")
          .setDescription(`Open a district`)
          .addStringOption((option) =>
            option
              .setRequired(true)
              .setName("district")
              .setDescription(`The district to open entries to`)
              .setChoices(districtChoices)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("close")
          .setDescription(`Close a district`)
          .addStringOption((option) =>
            option
              .setName("district")
              .setRequired(true)
              .setChoices(districtChoices)
              .setDescription(`The district to close`)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("set-entry-message")
          .setDescription(`Set entry message`)
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("increase-dorm-capacity")
          .setDescription(`Increase the capacity of all dormitories.`)
          .addNumberOption((option) =>
            option
              .setName("amount")
              .setRequired(true)
              .setDescription(`The amount to increase by`)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("test").setDescription(`Do something.`)
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("user-search")
          .setDescription(`Search for a user by name`)
          .addStringOption((option) =>
            option
              .setName("query")
              .setRequired(true)
              .setDescription(`The search string.`)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("open-shelters").setDescription(`Open the shelters.`)
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("close-shelters")
          .setDescription(`Close the shelters.`)
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("backfill-engagement")
          .setDescription(`Backfill engagement`)
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("purge")
          .setDescription(`Purge an onboarding thread.`)
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("send-next-steps")
          .setDescription(`Sends the next steps message.`)
          .addUserOption((option) =>
            option.setName("member").setDescription("The member to address")
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("create-invite-link")
          .setDescription(`Create an invite link.`)
          .addStringOption((option) =>
            option
              .setName("campaign")
              .setRequired(true)
              .setDescription(
                `A memorable word or short phrase to associate the link with.`
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("set-nickname")
          .setDescription(`Set a members nickname`)
          .addUserOption((option) =>
            option
              .setName("member")
              .setRequired(true)
              .setDescription("The user to eject")
          )
          .addStringOption((option) =>
            option
              .setName("name")
              .setRequired(true)
              .setDescription(`The nickname to give`)
          )
      )
      .toJSON(),
  },
  {
    id: "AWARD_ACHIEVEMENT",
    permissions: [
      { id: "ADMIN", type: 1, permission: true },
      { id: "STAFF", type: 1, permission: true },
      { id: "MODS", type: 1, permission: true },
    ],
    data: new SlashCommandBuilder()
      .setName("award-achievement")
      .setDescription(`Awards an achievement`)
      .addUserOption((option) =>
        option
          .setName("member")
          .setRequired(true)
          .setDescription("The user to award")
      )
      .addStringOption((option) =>
        option
          .setRequired(true)
          .setName("achievement")
          .setDescription(`The acheivement to award`)
          .setChoices(achievementChoices)
      )
      .toJSON(),
  },
  {
    id: "REWARD",
    permissions: [
      { id: "ADMIN", type: 1, permission: true },
      { id: "STAFF", type: 1, permission: true },
      { id: "MODS", type: 1, permission: true },
      { id: "HIGH_COMMAND", type: 1, permission: true },
    ],
    data: new SlashCommandBuilder()
      .setName("reward")
      .setDescription(
        `Reward people with ${Format.currency(null, { bold: false })}`
      )
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("The member to reward with $GBT.")
          .setRequired(true)
      )
      .addNumberOption((option) =>
        option
          .setName("amount")
          .setDescription(
            `The amount of ${Format.currency(null, { bold: false })} send`
          )
          .setRequired(true)
      )
      .toJSON(),
  },
];

export default admin;
