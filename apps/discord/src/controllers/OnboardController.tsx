import React from "react";
import Config from "config";
import {
  ButtonInteraction,
  GuildMember,
  MessageActionRow,
  MessageEmbed,
  Message,
  TextBasedChannel,
} from "discord.js";
import { User, Achievement, InvitedUser } from "data/db";
import { Achievement as AchievementEnum } from "data/types";
import { OnboardDialogAlly, OnboardDialogBB } from "../legacy/onboard-dialog";
import Utils from "../Utils";
import { makeButton } from "../legacy/utils";
import { transactBalance } from "../legacy/db";
import AchievementController from "./AchievementController";
import UserController from "./UserController";
import { FirstActivityReply } from "../legacy/templates";
import { Global } from "../Global";
import { In } from "typeorm";
import Events from "../Events";
import DiscordBot from "../DiscordBot";
import { userMention } from "@discordjs/builders";

const { r } = Utils;

export default class OnboardController {
  static async bindEventListeners() {
    await this.bindButtonListeners();
  }

  static async getMemberFromInteraction(
    i: ButtonInteraction
  ): Promise<GuildMember> {
    return i.member as GuildMember;
  }

  static async getMessageFromInteraction(
    i: ButtonInteraction
  ): Promise<Message> {
    if ("edit" in i.message) {
      return i.message;
    }
    const channel = await i.client.channels.fetch(i.channelId);
    if (!channel?.isText()) {
      throw new Error("Non text channel");
    }
    return channel.messages.fetch(i.message.id);
  }

  static async getChannelFromInteraction(
    i: ButtonInteraction
  ): Promise<TextBasedChannel> {
    if (i.channel) {
      return i.channel;
    }
    const channel = await i.client.channels.fetch(i.channelId);
    if (!channel || !channel.isText()) {
      throw new Error("Channel not found");
    }
    return channel;
  }

  static async getInteractionProps(i: ButtonInteraction): Promise<{
    member: GuildMember;
    channel: TextBasedChannel;
    message: Message;
  }> {
    const [member, channel, message] = await Promise.all([
      await this.getMemberFromInteraction(i),
      await this.getChannelFromInteraction(i),
      await this.getMessageFromInteraction(i),
    ]);
    return { member, channel, message };
  }

  static async bindButtonListeners() {
    const [bb, ally] = Global.bots("BIG_BROTHER", "ALLY");
    await Promise.all([bb.ready, ally.ready]);

    bb.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) {
        return;
      }
      const [type] = i.customId.split(":");
      if (type === "UNDERSTAND_RESPONSE") {
        this.sendUnderstandResponse(i);
      }
    });

    ally.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) {
        return;
      }
      const [type] = i.customId.split(":");
      if (type === "IS_HE_GONE_RESPONSE") {
        this.sendIsHeGoneResponse(i);
      }

      if (type === "FIRST_WORLD_CHOICE") {
        this.sendFirstWorldChoiceResponse(i);
      }
    });
  }

  static async getChannel(user: User, bot: DiscordBot) {
    const tenancy = user.primaryTenancy;

    if (tenancy.type === "APARTMENT") {
      return bot.getTextChannel(tenancy.discordChannelId);
    }

    const dormId = Config.channelId(tenancy.dormitory.symbol);
    const dormChannel = await bot.getTextChannel(dormId);
    const bunk = await dormChannel.threads.fetch(tenancy.bunkThreadId);

    return bunk!;
  }

  static async sendInitialMessage(user: User) {
    const bb = Global.bot("BIG_BROTHER");
    const channel = await this.getChannel(user, bb);
    const member = await UserController.getMember(user.discordId);

    await channel.send(r(<OnboardDialogBB part={1} member={member!} />));
    await Utils.delay(2500);

    await channel.send(r(<OnboardDialogBB part={2} member={member!} />));
    await Utils.delay(3000);

    await channel.send(
      r(
        <OnboardDialogBB
          part={3}
          member={member!}
          channelId={channel.id}
          type={user.primaryTenancy.type}
        />
      )
    );
    await Utils.delay(3500);

    await channel.send({
      content: r(<OnboardDialogBB part={4} member={member} />),
      components: [
        new MessageActionRow().addComponents(
          makeButton(`UNDERSTAND_RESPONSE:YES:${member.id}`, undefined, "Yes"),
          makeButton(`UNDERSTAND_RESPONSE:NO:${member.id}`, undefined, "No")
        ),
      ],
    });
  }

  static async sendUnderstandResponse(i: ButtonInteraction) {
    const user = await User.findOneOrFail({ where: { discordId: i.user.id } });

    const { member, channel, message } = await this.getInteractionProps(i);

    const [_, response, memberId] = i.customId.split(":") as [
      string,
      "YES" | "NO",
      string
    ];

    if (member.id !== memberId) {
      await i.reply({
        content: `${userMention(member.id)} - Go press your own buttons.`,
        ephemeral: true,
      });
      return;
    }

    await message.edit({
      content: r(<OnboardDialogBB part={4} member={member} />),
      components: [
        new MessageActionRow().addComponents(
          makeButton("yes", {
            disabled: true,
            selected: response === "YES",
          }),
          makeButton("no", {
            disabled: true,
            selected: response === "NO",
          })
        ),
      ],
    });

    await Promise.all([
      i.update({ fetchReply: false }),
      transactBalance(member.id, response === "YES" ? 100 : 40),
    ]);

    await channel.send({
      content: r(
        <OnboardDialogBB member={member} part={5} response={response} />
      ),
    });

    await Utils.delay(2500);
    await channel.send({
      content: r(
        <OnboardDialogBB part={6} member={member} response={response} />
      ),
    });

    await Utils.delay(3000);
    await channel.send({
      content: r(<OnboardDialogBB part={7} member={member} />),
    });

    await Utils.delay(4000);
    await channel.send({
      content: r(<OnboardDialogBB part={8} member={member} />),
    });

    await Utils.delay(1000);
    await OnboardController.switchOnboardNPCs(user);
    await Utils.delay(1000);
    await this.sendAllyIntroduction(user);
  }

  static async sendAllyIntroduction(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await this.getChannel(user, ally);
    const member = await ally.getMember(user.discordId);

    if (channel === null || member === null) {
      throw new Error("Invalid channel/member");
    }

    const shruggy = "\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af";
    await channel.send({
      content: r(<OnboardDialogAlly part={1} member={member!} />),
      components: [
        new MessageActionRow().addComponents(
          makeButton(`IS_HE_GONE_RESPONSE:YES:${member.id}`, undefined, "Yes"),
          makeButton(`IS_HE_GONE_RESPONSE:NO:${member.id}`, undefined, "No"),
          makeButton(
            `IS_HE_GONE_RESPONSE:UNSURE:${member.id}`,
            undefined,
            shruggy
          )
        ),
      ],
    });
  }

  static async sendIsHeGoneResponse(i: ButtonInteraction) {
    const { member, channel, message } = await this.getInteractionProps(i);

    const [_key, response, memberId] = i.customId.split(":") as [
      string,
      "YES" | "NO" | "UNSURE",
      string
    ];

    if (member.id !== memberId) {
      await i.reply({
        content: `${userMention(member.id)} - Go press your own buttons.`,
        ephemeral: true,
      });
      return;
    }

    const shruggy = "\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af";

    await message.edit({
      content: r(<OnboardDialogAlly part={1} member={member} />),
      components: [
        new MessageActionRow().addComponents(
          makeButton("yes", {
            disabled: true,
            selected: response === "YES",
          }),
          makeButton("no", {
            disabled: true,
            selected: i.customId === "NO",
          }),
          makeButton(
            "unsure",
            {
              disabled: true,
              selected: i.customId === "UNSURE",
            },
            shruggy
          )
        ),
      ],
    });

    i.update({ fetchReply: false });

    await channel.send(
      r(<OnboardDialogAlly part={2} member={member} response={response} />)
    );
    await Utils.delay(3000);

    await channel.send(r(<OnboardDialogAlly member={member} part={3} />));
    await Utils.delay(4000);

    await channel.send({
      content: r(<OnboardDialogAlly member={member} part={4} />),
      embeds: [
        new MessageEmbed().setImage(
          "https://s10.gifyu.com/images/red-pill.gif"
        ),
      ],
    });
    await Utils.delay(1000);

    await channel.send(r(<OnboardDialogAlly member={member} part={5} />));
  }

  static async sendRedPillTakenResponse(user: User) {
    const ally = Global.bot("ALLY");

    await AchievementController.award(user, AchievementEnum.JOINED_THE_DEGENZ);

    await UserController.openWorld(user);

    await Utils.delay(3000);

    const channel = await this.getChannel(user, ally);
    const member = await ally.getMember(user.discordId);

    await channel.send(r(<OnboardDialogAlly member={member!} part={6} />));
    await Utils.delay(3000);

    await channel.send(r(<OnboardDialogAlly member={member!} part={7} />));
    await Utils.delay(2500);

    await channel.send(r(<OnboardDialogAlly member={member!} part={8} />));
  }

  static async sendStatsCheckedResponse(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await this.getChannel(user, ally);
    const member = await ally.getMember(user.discordId);

    await channel.send(r(<OnboardDialogAlly member={member!} part={9} />));
    await Utils.delay(2000);

    await AchievementController.award(user!, AchievementEnum.STATS_CHECKED);

    await Utils.delay(3000);

    await channel.send(r(<OnboardDialogAlly member={member!} part={10} />));
    await Utils.delay(2000);

    await channel.send(r(<OnboardDialogAlly member={member!} part={11} />));
    await Utils.delay(2500);

    await channel.send(r(<OnboardDialogAlly member={member!} part={12} />));
  }

  static async sendHelpRequestedResponse(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await this.getChannel(user, ally);
    const member = await ally.getMember(user.discordId);

    await Utils.delay(2000);

    await AchievementController.award(user, AchievementEnum.HELP_REQUESTED);
    await Utils.delay(2000);

    await channel.send(r(<OnboardDialogAlly member={member!} part={13} />));
    await Utils.delay(2000);

    await Promise.all([
      this.updateInvite(user),
      await OnboardController.sendNextPrompt(user),
    ]);
  }

  static async sendNextPrompt(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await this.getChannel(user, ally);

    await channel.send({
      content:
        "There's lots to see and do here, so what do you feel like doing?",
      components: [
        new MessageActionRow().addComponents(
          makeButton(
            `FIRST_WORLD_CHOICE:FIGHT:${user.discordId}`,
            undefined,
            "Fight"
          ),
          makeButton(
            `FIRST_WORLD_CHOICE:GAMBLE:${user.discordId}`,
            undefined,
            "Gamble"
          ),
          makeButton(
            `FIRST_WORLD_CHOICE:SHOP:${user.discordId}`,
            undefined,
            "Shop"
          )
        ),
      ],
    });
  }

  static async sendFirstWorldChoiceResponse(i: ButtonInteraction) {
    const { member, channel, message } = await this.getInteractionProps(i);

    const [_key, response, memberId] = i.customId.split(":") as [
      string,
      "FIGHT" | "GAMBLE" | "SHOP",
      string
    ];

    if (member.id !== memberId) {
      await i.reply({
        content: `${userMention(member.id)} - Go press your own buttons.`,
        ephemeral: true,
      });
      return;
    }

    await message.edit({
      content:
        "There's lots to see and do here, so what do you feel like doing?",
      components: [
        new MessageActionRow().addComponents(
          makeButton("fight", {
            disabled: true,
            selected: response === "FIGHT",
          }),
          makeButton("gamble", {
            disabled: true,
            selected: response === "GAMBLE",
          }),
          makeButton("shop", {
            disabled: true,
            selected: response === "SHOP",
          })
        ),
      ],
    });
    i.update({ fetchReply: false });

    await channel.send(r(<FirstActivityReply choice={response} />));
    await Utils.delay(3000);

    await channel.send(r(<OnboardDialogAlly member={member!} part={14} />));
    await Utils.delay(2500);

    await channel.send(r(<OnboardDialogAlly member={member!} part={15} />));

    const user = await User.findOneOrFail({ where: { discordId: memberId } });
    Events.emit("FIRST_WORLD_CHOICE", { user, choice: response });
  }

  static async switchOnboardNPCs(user: User) {
    const admin = Global.bot("ADMIN");
    const channel = await this.getChannel(user, admin);

    if (channel.type === "GUILD_TEXT") {
      await channel.permissionOverwrites.delete(
        Config.roleId("BIG_BROTHER_BOT")
      );

      await Utils.delay(2000);

      await channel.permissionOverwrites.create(Config.roleId("ALLY_BOT"), {
        VIEW_CHANNEL: true,
        EMBED_LINKS: true,
      });
    }

    if (channel.isThread()) {
      await channel.members.remove(Config.clientId("BIG_BROTHER"));
      await Utils.delay(2000);
      await channel.members.add(Config.clientId("ALLY"));
    }
  }

  static async updateInvite(user: User) {
    const invite = await InvitedUser.findOne({ where: { discordId: user.id } });
    if (invite) {
      invite.accepted = true;
      await invite.save();
    }
  }

  static async skip(user: User) {
    await UserController.openWorld(user);

    const achievements = await Achievement.find({
      where: {
        symbol: In([
          AchievementEnum.JOINED_THE_DEGENZ,
          AchievementEnum.HELP_REQUESTED,
          AchievementEnum.STATS_CHECKED,
        ]),
      },
    });

    user.achievements = achievements;

    await user.save();
  }
}
