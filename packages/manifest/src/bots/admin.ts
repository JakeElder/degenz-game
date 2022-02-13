import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot } from "types";
import Config from "app-config";
import { Formatter } from "lib";
import { Intents } from "discord.js";

const { format } = Formatter;
const { FLAGS } = Intents;

const admin: Bot = {
  id: "ADMIN",
  name: "Degenz Admin",
  clientOptions: {
    intents: [FLAGS.GUILDS, FLAGS.GUILD_MEMBERS, FLAGS.GUILD_MESSAGES],
  },
  commands: [],
};

// Admin command
admin.commands.push({
  id: "admin",
  permissions: [{ id: Config.roleId("ADMIN"), type: 1, permission: true }],
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription(`Find out about ${format("WORLD_NAME")} and it's citizens`)
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
        .addNumberOption((option) =>
          option
            .setName("district")
            .setChoices([
              ["District 1", 1],
              ["District 2", 2],
              ["District 3", 3],
              ["District 4", 4],
              ["District 5", 5],
              ["District 6", 6],
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
        .setName("generate-invite")
        .setDescription(`Generate an invite code`)
        .addStringOption((option) =>
          option
            .setName("tag")
            .setRequired(true)
            .setDescription("A tag to identify the invite")
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
        .setDescription(`Issue ${format("currency", { bold: false })}`)
        .addNumberOption((option) =>
          option
            .setName("amount")
            .setRequired(true)
            .setDescription(
              `The amount of ${format("currency", {
                long: false,
                bold: false,
              })} send`
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("open")
        .setDescription(`Open a district`)
        .addNumberOption((option) =>
          option
            .setName("district")
            .setChoices([
              ["District 1", 1],
              ["District 2", 2],
              ["District 3", 3],
              ["District 4", 4],
              ["District 5", 5],
              ["District 6", 6],
            ])
            .setRequired(true)
            .setDescription(`The district to open`)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("close").setDescription(`Close entries`)
    )
    .toJSON(),
});

export default admin;
