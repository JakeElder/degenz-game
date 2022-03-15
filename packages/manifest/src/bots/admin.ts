import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot, DistrictSymbol } from "data/types";
import Config from "config";
import { Format } from "lib";
import { Intents } from "discord.js";

const { FLAGS } = Intents;

const admin: Bot = {
  symbol: "ADMIN",
  name: "Degenz Admin",
  clientOptions: {
    intents: [FLAGS.GUILDS, FLAGS.GUILD_MEMBERS, FLAGS.GUILD_MESSAGES],
  },
  commands: [],
};

// Admin command
admin.commands.push({
  symbol: "ADMIN",
  permissions: [{ id: Config.roleId("ADMIN"), type: 1, permission: true }],
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
            .setChoices([
              ["District 1", DistrictSymbol.PROJECTS_D1],
              ["District 2", DistrictSymbol.PROJECTS_D2],
              ["District 3", DistrictSymbol.PROJECTS_D3],
              ["District 4", DistrictSymbol.PROJECTS_D4],
              ["District 5", DistrictSymbol.PROJECTS_D5],
              ["District 6", DistrictSymbol.PROJECTS_D6],
            ])
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
        .setName("imprison")
        .setDescription(`Imprison a member`)
        .addUserOption((option) =>
          option
            .setName("member")
            .setRequired(true)
            .setDescription("The member to imprison")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("release")
        .setDescription(`Release a prisoner`)
        .addUserOption((option) =>
          option
            .setName("member")
            .setRequired(true)
            .setDescription("The member to release")
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
            .setChoices([
              ["District 1", DistrictSymbol.PROJECTS_D1],
              ["District 2", DistrictSymbol.PROJECTS_D2],
              ["District 3", DistrictSymbol.PROJECTS_D3],
              ["District 4", DistrictSymbol.PROJECTS_D4],
              ["District 5", DistrictSymbol.PROJECTS_D5],
              ["District 6", DistrictSymbol.PROJECTS_D6],
            ])
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
            .setChoices([
              ["District 1", DistrictSymbol.PROJECTS_D1],
              ["District 2", DistrictSymbol.PROJECTS_D2],
              ["District 3", DistrictSymbol.PROJECTS_D3],
              ["District 4", DistrictSymbol.PROJECTS_D4],
              ["District 5", DistrictSymbol.PROJECTS_D5],
              ["District 6", DistrictSymbol.PROJECTS_D6],
            ])
            .setDescription(`The district to close`)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set-entry-message")
        .setDescription(`Set entry message`)
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("available").setDescription(`Available`)
    )
    .toJSON(),
});

export default admin;
