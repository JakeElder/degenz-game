import React from "react";
import Config from "config";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageEmbed,
  ThreadChannel,
} from "discord.js";
import { User, Achievement, OnboardingChannel, DiscordChannel } from "data/db";
import {
  AllyIntro,
  ApartmentIssuance,
  BBExit,
  BBIntro,
  ChannelListTraining,
  DormAssignment,
  GoodBadTraining,
  HelpPrompt,
  InitiationCongrats,
  IsHeGone,
  MoneyIssuance,
  NarkCheck,
  OneMoreThing,
  RedpillPrompt,
  StatsRewardMessage,
  UnderstandPrompt,
  UnderstandResponse,
  WelcomeComrade,
  WorldIntro,
  GBTReward,
  GBTUsage,
} from "../legacy/onboard-dialog";
import Utils from "../Utils";
import { makeButton } from "../legacy/utils";
import { transactBalance } from "../legacy/db";
import AchievementController from "./AchievementController";
import UserController from "./UserController";
import { Global } from "../Global";
import { In } from "typeorm";
import DiscordBot from "../DiscordBot";
import { userMention } from "@discordjs/builders";
import NextStepController from "./NextStepsController";
import Interaction from "../Interaction";
import Events from "../Events";
import { Channel } from "../Channel";
import { AchievementSymbol } from "data/types";
import QuestLogController from "./QuestLogController";
import SelfDestructController from "./SelfDestructController";
import { ChannelMention } from "../legacy/templates";
import { paramCase } from "change-case";

const { r } = Utils;

export default class OnboardController {
  static async bindEventListeners() {
    await this.bindButtonListeners();
  }

  static async bindButtonListeners() {
    const [bb, ally, admin] = Global.bots("BIG_BROTHER", "ALLY", "ADMIN");
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
    });

    admin.client.on("threadUpdate", async (prev, thread) => {
      if (!prev.archived && thread.archived) {
        if (await this.isOnboardingThread(thread)) {
          this.purge(thread);
        }
      }
    });

    admin.client.on("threadDelete", async (thread) => {
      if (await this.isOnboardingThread(thread)) {
        this.purge(thread);
      }
    });
  }

  static async isOnboardingThread(thread: ThreadChannel) {
    const c = await Channel.getDescriptor(thread.id);
    return c.isOnboardingThread;
  }

  static async start(user: User) {
    const admin = Global.bot("ADMIN");
    const entrance = await admin.getTextChannel(Config.channelId("ENTRANCE"));

    const thread = await entrance.threads.create({
      name: `📟｜${paramCase(user.displayName)}s-orientation`,
      invitable: false,
      autoArchiveDuration: 60,
      type:
        admin.guild.features.includes("PRIVATE_THREADS") ||
        Config.env("NODE_ENV") === "production"
          ? "GUILD_PRIVATE_THREAD"
          : "GUILD_PUBLIC_THREAD",
    });

    user.onboardingChannel = OnboardingChannel.create({
      user,
      discordChannel: DiscordChannel.create({
        type: "ONBOARDING_THREAD",
        id: thread.id,
      }),
    });

    await user.save();

    return thread;
  }

  static async getOnboardingChannel(user: User, bot: DiscordBot) {
    return Utils.Thread.getOrFail(
      user.onboardingChannel.discordChannel.id,
      bot.npc.id
    );
  }

  static async sendInitialMessage(user: User) {
    const bb = Global.bot("BIG_BROTHER");
    const channel = await this.getOnboardingChannel(user, bb);
    const member = await UserController.getMember(user.id);

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
    const user = await User.findOneOrFail({ where: { id: i.user.id } });

    const { member, channel, message } = await Interaction.getProps(i);

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
    const channel = await this.getOnboardingChannel(user, ally);
    const member = await ally.getMember(user.id);

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
    const { member, channel, message } = await Interaction.getProps(i);

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
    await AchievementController.award(user, "JOIN_THE_DEGENZ_QUEST_COMPLETED");
    await Utils.delay(3000);

    const channel = await this.getOnboardingChannel(user, ally);

    await channel.send(r(<InitiationCongrats />));
    await Utils.delay(3000);

    await channel.send(r(<GBTReward initial={user.gbt - 100} net={100} />));
    await Utils.delay(1000);

    await channel.send(r(<GBTUsage />));

    const questThread = await QuestLogController.show(user.id);

    await SelfDestructController.init(channel, 30, async () => {
      this.purge(channel);
    });

    await channel.send("Ok, that's it for now.. get out of here!!");
    await channel.send(
      r(
        <>
          **GO TO** <ChannelMention id={questThread.id} /> to see how you can
          earn more {Config.emojiCode("GBT_COIN")}!
        </>
      )
    );
  }

  static async sendStatsCheckedResponse(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await this.getOnboardingChannel(user, ally);

    await channel.send(r(<StatsRewardMessage />));
    await Utils.delay(2000);

    await AchievementController.award(user, "STATS_CHECKED");

    await Utils.delay(3000);

    await channel.send(r(<OneMoreThing />));
    await Utils.delay(2000);

    await channel.send(r(<WorldIntro />));
    await Utils.delay(2500);

    await channel.send(r(<HelpPrompt />));
  }

  static async sendHelpRequestedResponse(user: User) {
    //   const ally = Global.bot("ALLY");
    //   const channel = await this.getOnboardingChannel(user, ally);
    //   await Utils.delay(2000);
    //   await AchievementController.award(user, "HELP_REQUESTED");
    //   await Utils.delay(2000);
    //   await Utils.delay(2000);
    //   await OnboardController.sendSelfDestructMessage(user);
  }

  static async sendNextPrompt(user: User) {
    const ally = Global.bot("ALLY");
    const channel = await ally.guild.channels.fetch(
      user.primaryTenancy.discordChannelId
    );

    if (!channel || !channel.isText()) {
      throw new Error("Channel not found");
    }

    await NextStepController.send(channel, user);
  }

  static async switchOnboardNPCs(user: User) {
    const admin = Global.bot("ADMIN");
    const channel = await this.getOnboardingChannel(user, admin);

    await channel.members.remove(Config.clientId("BIG_BROTHER"));
    await Utils.delay(2000);
    await channel.members.add(Config.clientId("ALLY"));
  }

  static async skip(user: User) {
    const onboardingAchievements: AchievementSymbol[] = [
      "JOIN_THE_DEGENZ_QUEST_COMPLETED",
      "HELP_REQUESTED",
      "STATS_CHECKED",
    ];

    const achievements = await Achievement.find({
      where: { id: In(onboardingAchievements) },
    });

    user.achievements = achievements;
    await user.save();
  }

  static async purge(thread: ThreadChannel) {
    const c = await OnboardingChannel.findOne({
      where: { discordChannel: { id: thread.id } },
      relations: ["user", "user.achievements", "discordChannel"],
    });

    if (c) {
      await c.remove();
      await c.discordChannel.remove();
    }

    try {
      await thread.delete();
    } catch (e) {}

    if (c) {
      await QuestLogController.refresh(c.user);
      Events.emit("ONBOARDING_THREAD_PURGED", {
        user: c.user,
        redpilled: c.user.hasAchievement("JOIN_THE_DEGENZ_QUEST_COMPLETED")
          ? "YES"
          : "NO",
      });
    }
  }
}
