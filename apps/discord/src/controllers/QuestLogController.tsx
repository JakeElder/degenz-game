import React from "react";
import { paramCase } from "change-case";
import Config from "config";
import {
  QuestLogChannel,
  User,
  Channel,
  QuestLogMessage,
  Pledge,
} from "data/db";
import {
  ButtonInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
  MessageOptions,
  ThreadChannel,
  Util,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Global } from "../Global";
import Utils from "../Utils";
import { ChannelMention, UserMention } from "../legacy/templates";
import { Format } from "lib";
import { QuestSymbol } from "data/types";
import { Routes } from "discord-api-types/v10";

const rest = new REST({ version: "10", rejectOnRateLimit: ["/"] }).setToken(
  Config.botToken("ADMIN")
);

const { r } = Utils;

export default class QuestLogController {
  static async init() {
    await this.bindEventListeners();
    await this.refresh();
  }

  static async bindEventListeners() {
    const admin = Global.bot("ADMIN");

    admin.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) {
        return;
      }
      const [type] = i.customId.split(":");
      if (type === "TOGGLE_QUEST_DETAILS") {
        this.toggleQuestDetails(i);
      }
    });

    admin.client.on("threadUpdate", async (prev, thread) => {
      if (!prev.archived && thread.archived) {
        const c = await QuestLogChannel.findOne({
          where: { channel: { discordId: thread.id } },
          relations: ["user", "user.achievements", "channel"],
        });

        if (c) {
          await c.remove();
          await c.channel.remove();
          await thread.delete();
        }
      }
    });
  }

  static async refresh(user?: User) {
    const channels = await QuestLogChannel.find({
      ...(user ? { where: { user: { id: user.id } } } : {}),
      relations: ["user", "user.achievements", "channel", "questLogMessages"],
    });

    await Promise.all(
      channels.map(async (c) => {
        c.user.questLogChannel = c;
        return this.updateQuestMessage(c, "PLEDGE");
      })
    );
  }

  static async updateQuestMessage(qlc: QuestLogChannel, quest: QuestSymbol) {
    const qlm = qlc.questLogMessages.find((m) => m.quest === quest);
    const thread = await this.fetchExistingThread(qlc.user);

    if (qlm) {
      const message = await thread.messages.fetch(qlm.discordId);
      if (message) {
        const options = await this.makePledgeQuestMessage(
          qlc.user,
          qlm.expanded
        );

        await rest.patch(
          Routes.channelMessage(qlc.channel.discordId, message.id),
          { body: options }
        );
        await message.edit(options);
      }
    }
  }

  static async toggleQuestDetails(i: ButtonInteraction) {
    const [_e, questSymbol, memberId] = i.customId.split(":") as [
      string,
      QuestSymbol,
      GuildMember["id"]
    ];

    const channel = await QuestLogChannel.findOne({
      where: { user: { discordId: memberId } },
      relations: ["user", "user.achievements", "channel", "questLogMessages"],
    });

    if (!channel) {
      throw new Error("QuestLogChannel not found");
    }

    channel.user.questLogChannel = channel;

    const message = channel.questLogMessages.find(
      (m) => m.quest === questSymbol
    )!;

    message.expanded = !message.expanded;

    await this.updateQuestMessage(channel, questSymbol);
    await i.update({ fetchReply: false });
    await channel.save();
  }

  static async show(member: GuildMember) {
    const user = await User.findOne({
      where: { discordId: member.id },
      relations: [
        "achievements",
        "questLogChannel",
        "questLogChannel.channel",
        "questLogChannel.questLogMessages",
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { thread, isNew } = await this.getQuestLogChannel(user);

    if (isNew) {
      await this.sendQuestMessages(user, thread);
    }

    return thread;
  }

  static async sendQuestMessages(user: User, thread: ThreadChannel) {
    const pledgeMessageOptions = await this.makePledgeQuestMessage(user);
    const pledgeMessage = await thread.send(pledgeMessageOptions);

    user.questLogChannel.questLogMessages ??= [];

    user.questLogChannel.questLogMessages.push(
      QuestLogMessage.create({
        quest: "PLEDGE",
        questLogChannel: user.questLogChannel,
        discordId: pledgeMessage.id,
      })
    );

    await user.save();
  }

  static async fetchExistingThread(user: User) {
    const admin = Global.bot("ADMIN");
    const lc = await admin.guild.channels.fetch(Config.channelId("QUESTS"));

    if (!lc || lc.type !== "GUILD_TEXT") {
      throw new Error("Quests channel not found");
    }

    const threadId = user.questLogChannel.channel.discordId;
    const thread = await lc.threads.fetch(threadId);

    if (!thread) {
      throw new Error("Quest log not found");
    }

    return thread;
  }

  static async getQuestLogChannel(user: User) {
    if (!user.questLogChannel) {
      const thread = await this.createQuestLogChannel(user);
      return { thread, isNew: true };
    }

    const thread = await this.fetchExistingThread(user);

    return { thread, isNew: false };
  }

  static async createQuestLogChannel(user: User) {
    const admin = Global.bot("ADMIN");

    const questsChannel = await admin.guild.channels.fetch(
      Config.channelId("QUESTS")
    );

    if (!questsChannel || questsChannel.type !== "GUILD_TEXT") {
      throw new Error("Quests channel not found");
    }

    const thread = await questsChannel.threads.create({
      name: `\u2658\uFF5C${paramCase(user.displayName)}s-quest-log`,
      invitable: false,
      autoArchiveDuration: 60,
      type: ["production"].includes(Config.env("NODE_ENV"))
        ? "GUILD_PRIVATE_THREAD"
        : "GUILD_PUBLIC_THREAD",
    });

    user.questLogChannel = QuestLogChannel.create({
      user,
      channel: Channel.create({
        type: "QUEST_LOG_THREAD",
        discordId: thread.id,
      }),
    });

    await user.save();
    return thread;
  }

  static async makePledgeQuestMessage(
    user: User,
    expanded: boolean = false
  ): Promise<MessageOptions> {
    const claim = new MessageButton()
      .setLabel(expanded ? "Hide Details" : "Show Details")
      .setStyle("SUCCESS")
      .setCustomId(`TOGGLE_QUEST_DETAILS:PLEDGE:${user.discordId}`);

    const pledges = await Pledge.count({
      where: { user: { id: user.id } },
    });
    const complete = pledges > 0;

    const color: MessageEmbedOptions["color"] = complete
      ? Util.resolveColor("GREEN")
      : Util.resolveColor("RED");

    const options: MessageOptions = {
      embeds: [
        {
          title: "Pledge Allegiance to Big Brother",
          thumbnail: {
            url: `${Config.env("WEB_URL")}/characters/npcs/BIG_BROTHER.png?`,
          },
          color,
          description: r(
            <>
              Pledge your allegiance to{" "}
              <UserMention id={Config.clientId("BIG_BROTHER")} /> and receive **
              {Format.token()}**.
            </>
          ),
          fields: [
            {
              name: "Progress",
              value: complete ? "\u2705 Complete" : "\u274c Incomplete",
            },
          ],
        },
      ],
      components: [new MessageActionRow().addComponents(claim)],
    };

    if (expanded) {
      options.embeds![0].fields!.push({
        name: "Details",
        inline: false,
        value: r(
          <>
            Go to <ChannelMention id={Config.channelId("HALL_OF_ALLEIGANCE")} />{" "}
            and press the **PLEDGE** button to receive your first allowance.
          </>
        ),
      });
    }

    return options;
  }
}
