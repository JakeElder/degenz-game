import { paramCase } from "change-case";
import Config from "config";
import { QuestLogChannel, User, Channel, QuestLogMessage } from "data/db";
import {
  ButtonInteraction,
  GuildMember,
  Message,
  ThreadChannel,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { QuestSymbol } from "data/types";
import equal from "fast-deep-equal";
import { Routes } from "discord-api-types/v10";
import PledgeQuest from "../quests/PledgeQuest";
import Quest from "../Quest";
import { Global } from "../Global";
import LearnToHackerBattleQuest from "../quests/LearnToHackerBattleQuest";
import TossWithTedQuest from "../quests/TossWithTedQuest";
import ShopAtMerrisMartQuest from "../quests/ShopAtMerrisMartQuest";
import GetWhitelistQuest from "../quests/GetWhitelistQuest";

const rest = new REST({ version: "10", rejectOnRateLimit: ["/"] }).setToken(
  Config.botToken("ADMIN")
);

export default class QuestLogController {
  static quests: Quest[];
  static async init() {
    this.quests = [
      new PledgeQuest(),
      new GetWhitelistQuest(),
      new LearnToHackerBattleQuest(),
      new TossWithTedQuest(),
      new ShopAtMerrisMartQuest(),
    ];
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
        await this.purgeThread(thread);
      }
    });
  }

  static async createThread(user: User) {
    const admin = Global.bot("ADMIN");

    const questsChannel = await admin.guild.channels.fetch(
      Config.channelId("QUESTS")
    );

    if (!questsChannel || questsChannel.type !== "GUILD_TEXT") {
      throw new Error("Quests channel not found");
    }

    const thread = await questsChannel.threads.create({
      name: `📜｜${paramCase(user.displayName)}s-quest-log`,
      invitable: false,
      autoArchiveDuration: 60,
      type: ["production"].includes(Config.env("NODE_ENV"))
        ? "GUILD_PRIVATE_THREAD"
        : "GUILD_PUBLIC_THREAD",
    });

    await thread.members.add(user.id);

    user.questLogChannel = QuestLogChannel.create({
      user,
      channel: Channel.create({
        id: thread.id,
        type: "QUEST_LOG_THREAD",
      }),
    });

    await user.save();
    return thread;
  }

  static async purgeThreadForUser(user: User) {
    if (user.questLogChannel) {
      const thread = await this.fetchExistingThread(user);
      await this.purgeThread(thread);
    }
  }

  static async purgeThread(thread: ThreadChannel) {
    const c = await QuestLogChannel.findOne({
      where: { channel: { id: thread.id } },
      relations: ["user", "user.achievements", "channel"],
    });

    if (c) {
      await c.remove();
      await c.channel.remove();
      await thread.delete();
    }
  }

  static async refresh(user?: User) {
    const channels = await QuestLogChannel.find({
      ...(user ? { where: { user: { id: user.id } } } : {}),
      relations: ["user", "user.achievements", "channel", "questLogMessages"],
    });

    await Promise.all(
      channels.map(async (c) => {
        c.user.questLogChannel = c;
        const thread = await this.fetchExistingThread(c.user);

        if (thread.archived) {
          await this.purgeThread(thread);
          return;
        }

        if (
          !equal(
            this.quests.map((q) => q.symbol).sort(),
            c.questLogMessages.map((m) => m.quest).sort()
          )
        ) {
          if (c.questLogMessages.length) {
            await Promise.all([
              c.questLogMessages.map((m) =>
                thread.messages.delete(m.discordId)
              ),
            ]);
            await QuestLogMessage.remove(c.questLogMessages);
          }

          const user = await User.findOneOrFail({
            where: { id: c.user.id },
            relations: [
              "achievements",
              "questLogChannel",
              "questLogChannel.channel",
              "questLogChannel.questLogMessages",
            ],
          });
          await this.sendQuestMessages(user, thread);
          return;
        }

        await Promise.all(
          this.quests.map((q) => this.updateQuestMessage(c, q.symbol))
        );
      })
    );
  }

  static async updateQuestMessage(
    qlc: QuestLogChannel,
    questSymbol: QuestSymbol
  ) {
    const qlm = qlc.questLogMessages.find((m) => m.quest === questSymbol);
    if (!qlm) {
      throw new Error(
        `No db message for ${qlc.user.displayName}${questSymbol}`
      );
    }

    const thread = await this.fetchExistingThread(qlc.user);
    const message = await thread.messages.fetch(qlm.discordId);
    if (!message) {
      throw new Error(
        `Message for ${qlc.user.displayName}:${questSymbol} not found`
      );
    }

    const quest = this.quests.find((q) => q.symbol === questSymbol);
    if (!quest) {
      throw new Error(`Quest ${questSymbol} not found`);
    }

    const options = await quest.message(qlc.user, qlm.expanded);
    await rest.patch(Routes.channelMessage(qlc.channel.id, message.id), {
      body: options,
    });
    // await message.edit(options);
  }

  static async toggleQuestDetails(i: ButtonInteraction) {
    const [_e, questSymbol, memberId] = i.customId.split(":") as [
      string,
      QuestSymbol,
      GuildMember["id"]
    ];

    const channel = await QuestLogChannel.findOne({
      where: { user: { id: memberId } },
      relations: ["user", "user.achievements", "channel", "questLogMessages"],
    });

    if (!channel) {
      throw new Error("QuestLogChannel not found");
    }

    channel.user.questLogChannel = channel;

    const message = channel.questLogMessages.find(
      (m) => m.quest === questSymbol
    )!;

    // const expandedMessage = channel.questLogMessages.find((m) => m.expanded);
    // if (expandedMessage && expandedMessage.quest !== questSymbol) {
    //   expandedMessage.expanded = false;
    //   this.updateQuestMessage(channel, expandedMessage.quest);
    // }

    message.expanded = !message.expanded;

    await this.updateQuestMessage(channel, questSymbol);

    await i.update({ fetchReply: false });
    await channel.save();
  }

  static async show(member: GuildMember) {
    const user = await User.findOne({
      where: { id: member.id },
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
    const messages: Message[] = [];

    for (let i = 0; i < this.quests.length; i++) {
      const options = await this.quests[i].message(user, false);
      messages.push(await thread.send(options));
    }

    user.questLogChannel.questLogMessages = this.quests.map((q, idx) => {
      return QuestLogMessage.create({
        quest: q.symbol,
        questLogChannel: user.questLogChannel,
        discordId: messages[idx].id,
      });
    });

    await user.save();
  }

  static async fetchExistingThread(user: User) {
    const admin = Global.bot("ADMIN");
    const lc = await admin.guild.channels.fetch(Config.channelId("QUESTS"));

    if (!lc || lc.type !== "GUILD_TEXT") {
      throw new Error("Quests channel not found");
    }

    const threadId = user.questLogChannel.channel.id;
    const thread = await lc.threads.fetch(threadId);

    if (!thread) {
      throw new Error("Quest log not found");
    }

    return thread;
  }

  static async getQuestLogChannel(user: User) {
    if (!user.questLogChannel) {
      const thread = await this.createThread(user);
      return { thread, isNew: true };
    }

    const thread = await this.fetchExistingThread(user);

    return { thread, isNew: false };
  }
}
