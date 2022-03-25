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
import { User, Achievement } from "data/db";
import { Achievement as AchievementEnum } from "data/types";
import {
  AllyIntro,
  ApartmentIssuance,
  BBExit,
  BBIntro,
  ChannelListTraining,
  DormAssignment,
  GoExplore,
  GoodBadTraining,
  HelpPrompt,
  InitiationCongrats,
  IsHeGone,
  MeetYourDormMates,
  MoneyIssuance,
  NarkCheck,
  OneMoreThing,
  ReadyForDormResponse,
  RedpillPrompt,
  RememberHelp,
  SeeYa,
  StatsPrompt,
  StatsPromptPrep,
  StatsRewardMessage,
  UnderstandPrompt,
  UnderstandResponse,
  WelcomeComrade,
  WorldIntro,
} from "../legacy/onboard-dialog";
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
import { channelMention, userMention } from "@discordjs/builders";
import delay from "delay";
import { Format } from "lib";
import WorldNotifier from "../WorldNotifier";

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

      if (type === "READY_DORM_CHOICE") {
        this.sendAreYouReadyResponse(i);
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

    await channel.send(r(<WelcomeComrade member={member} />));
    await Utils.delay(2500);

    await channel.send(r(<BBIntro />));
    await Utils.delay(3000);

    await channel.send(
      user.primaryTenancy.type === "APARTMENT"
        ? r(<ApartmentIssuance channelId={channel.id} />)
        : r(<DormAssignment channelId={channel.id} />)
    );
    await Utils.delay(3500);

    await channel.send({
      content: r(<UnderstandPrompt />),
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
      content: r(<UnderstandResponse response={response} />),
    });

    await Utils.delay(2500);
    await channel.send({
      content: r(<MoneyIssuance response={response} />),
    });

    await Utils.delay(3000);
    await channel.send({
      content: r(<GoodBadTraining />),
    });

    await Utils.delay(4000);
    await channel.send({ content: r(<BBExit />) });

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
      content: r(<IsHeGone />),
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
      components: [
        new MessageActionRow().addComponents(
          makeButton("yes", {
            disabled: true,
            selected: response === "YES",
          }),
          makeButton("no", {
            disabled: true,
            selected: response === "NO",
          }),
          makeButton(
            "unsure",
            {
              disabled: true,
              selected: response === "UNSURE",
            },
            shruggy
          )
        ),
      ],
    });

    i.update({ fetchReply: false });

    await channel.send(r(<ChannelListTraining response={response} />));
    await Utils.delay(3000);

    await channel.send(r(<AllyIntro />));
    await Utils.delay(4000);

    await channel.send({
      content: r(<NarkCheck />),
      embeds: [
        new MessageEmbed().setImage(
          "https://s10.gifyu.com/images/red-pill.gif"
        ),
      ],
    });
    await Utils.delay(1000);

    await channel.send(r(<RedpillPrompt />));
  }

  static async sendRedPillTakenResponse(user: User) {
    const ally = Global.bot("ALLY");
    await AchievementController.award(user, AchievementEnum.JOINED_THE_DEGENZ);
    await UserController.openWorld(user);
    await Utils.delay(3000);

    const channel = await this.getChannel(user, ally);

    await channel.send(r(<InitiationCongrats />));
    await Utils.delay(3000);

    await channel.send(r(<StatsPromptPrep />));
    await Utils.delay(2500);

    await channel.send(r(<StatsPrompt />));
  }

  static async sendStatsCheckedResponse(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await this.getChannel(user, ally);

    await channel.send(r(<StatsRewardMessage />));
    await Utils.delay(2000);

    await AchievementController.award(user, AchievementEnum.STATS_CHECKED);

    await Utils.delay(3000);

    await channel.send(r(<OneMoreThing />));
    await Utils.delay(2000);

    await channel.send(r(<WorldIntro />));
    await Utils.delay(2500);

    await channel.send(r(<HelpPrompt />));
  }

  static async sendHelpRequestedResponse(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await this.getChannel(user, ally);

    await Utils.delay(2000);

    await AchievementController.award(user, AchievementEnum.HELP_REQUESTED);
    await Utils.delay(2000);

    if (user.primaryTenancy.type === "APARTMENT") {
      await channel.send(r(<GoExplore />));
      await Utils.delay(2000);
      await OnboardController.sendNextPrompt(user);
    } else {
      await OnboardController.sendThreadDestructPrompt(user);
    }
  }

  static async sendNextPrompt(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await ally.guild.channels.fetch(
      user.primaryTenancy.discordChannelId
    );

    if (!channel || !channel.isText()) {
      throw new Error("Channel not found");
    }

    await channel.send({
      content: `${
        user.primaryTenancy.type === "DORMITORY"
          ? `${userMention(user.discordId)} - `
          : ""
      }There's lots to see and do here in ${Format.worldName()}, so what do you feel like doing?`,
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

  static async sendThreadDestructPrompt(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await this.getChannel(user, ally);

    await Utils.delay(1000);

    await channel.send({
      content: r(
        <MeetYourDormMates
          emoji={user.dormitoryTenancy.dormitory.activeEmoji}
        />
      ),
      components: [
        new MessageActionRow().addComponents(
          makeButton(
            `READY_DORM_CHOICE:YES:${user.discordId}`,
            undefined,
            "Yea"
          ),
          makeButton(`READY_DORM_CHOICE:NO:${user.discordId}`, undefined, "No")
        ),
      ],
    });
  }

  static async sendAreYouReadyResponse(i: ButtonInteraction) {
    const { member, message, channel } = await this.getInteractionProps(i);
    const user = await User.findOneOrFail({ where: { discordId: i.user.id } });

    const [_key, response, memberId] = i.customId.split(":") as [
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

    i.update({ fetchReply: false });

    const m = await channel.send(
      r(
        <ReadyForDormResponse
          response={response}
          dormChannelId={user.dormitoryTenancy.dormitory.discordChannelId}
          seconds={10}
        />
      )
    );

    for (let i = 1; i < 10; i++) {
      await delay(1000);
      await m.edit(
        r(
          <ReadyForDormResponse
            response={response}
            dormChannelId={user.dormitoryTenancy.dormitory.discordChannelId}
            seconds={10 - i}
          />
        )
      );
    }

    await this.completeDormOnboarding(user);
  }

  static async completeDormOnboarding(user: User) {
    await WorldNotifier.logToChannel(
      user.dormitoryTenancy.dormitory.symbol,
      "ALLY",
      "ORIENTATION_COMPLETED",
      r(
        <>
          {userMention(user.discordId)}Completed onboarding {"\u{1f389}"}.
          **WELCOME** to our new{" "}
          {channelMention(user.primaryTenancy.discordChannelId)} dormitory
          **DEGEN** {"\u{1f44a}\u{1f44a}"}.
        </>
      )
    );
    const admin = Global.bot("ADMIN");
    const thread = await admin.guild.channels.fetch(
      user.dormitoryTenancy.bunkThreadId
    );
    if (thread && thread.isText()) {
      await thread.delete();
    }
    await this.sendNextPrompt(user);
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

    const user = await User.findOneOrFail({ where: { discordId: memberId } });

    if (user.dormitoryTenancy) {
      await i.reply({
        content: r(<FirstActivityReply choice={response} />),
        ephemeral: true,
      });
      await Utils.delay(3000);

      await i.followUp({ content: r(<RememberHelp />), ephemeral: true });
      await Utils.delay(2500);

      await i.followUp({ content: r(<SeeYa />), ephemeral: true });
    } else {
      i.update({ fetchReply: false });
      await channel.send(r(<FirstActivityReply choice={response} />));
      await Utils.delay(3000);

      await channel.send(r(<RememberHelp />));
      await Utils.delay(2500);

      await channel.send(r(<SeeYa />));
    }

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
