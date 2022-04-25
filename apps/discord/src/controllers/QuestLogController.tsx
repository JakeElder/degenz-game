import { paramCase } from "change-case";
import Config from "config";
import { QuestLogChannel, User, Channel } from "data/db";
import { TextBasedChannel, ThreadChannel } from "discord.js";
import { QuestLogMessage, QuestLogState, QuestSymbol } from "data/types";
import equal from "fast-deep-equal";
import { cloneDeep } from "lodash";
import PledgeQuest from "../quests/PledgeQuest";
import Quest from "../Quest";
import { Global } from "../Global";
import LearnToHackerBattleQuest from "../quests/LearnToHackerBattleQuest";
import TossWithTedQuest from "../quests/TossWithTedQuest";
import GetWhitelistQuest from "../quests/GetWhitelistQuest";
import ShopAtMerrisMartQuest from "../quests/ShopAtMerrisMartQuest";
import JoinTheDegenzQuest from "../quests/JoinTheDegenzQuest";
import Utils from "../Utils";

export default class QuestLogController {
  static quests: Quest[];
  static async init() {
    this.quests = [
      new JoinTheDegenzQuest(),
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

      const [type, quest, userId] = i.customId.split(":") as [
        string,
        QuestSymbol,
        User["id"]
      ];

      if (type === "TOGGLE_QUEST_DETAILS") {
        await this.toggle(userId, quest);
        await i.update({ fetchReply: false });
      }

      if (type === "START_JOIN_THE_DEGENZ_QUEST") {
        await i.reply({ content: "YOOO", ephemeral: true });
      }
    });

    admin.client.on("threadUpdate", async (prev, thread) => {
      if (!prev.archived && thread.archived) {
        if (await this.isQuestLogThread(thread)) {
          await this.purge(thread);
        }
      }
    });

    admin.client.on("threadDelete", async (thread) => {
      if (await this.isQuestLogThread(thread)) {
        await this.purge(thread);
      }
    });
  }

  static async isQuestLogThread(thread: ThreadChannel) {
    const c = await Utils.Channel.getDescriptor(thread.id);
    return c.isQuestLogThread;
  }

  static async show(userId: User["id"]): Promise<TextBasedChannel> {
    const qlc = await QuestLogChannel.findOne({
      where: { user: { id: userId } },
    });

    const thread = await (qlc
      ? Utils.Thread.getOrFail(qlc.channel.id)
      : this.createThread(userId));

    return thread;
  }

  static async createThread(userId: User["id"]) {
    const user = await User.findOneOrFail({ where: { id: userId } });

    const admin = Global.bot("ADMIN");
    const quests = await Utils.ManagedChannel.get("QUESTS");

    const thread = await quests.threads.create({
      name: `📜｜${paramCase(user.displayName)}s-quest-log`,
      invitable: false,
      autoArchiveDuration: 60,
      type:
        admin.guild.features.includes("PRIVATE_THREADS") ||
        ["production"].includes(Config.env("NODE_ENV"))
          ? "GUILD_PRIVATE_THREAD"
          : "GUILD_PUBLIC_THREAD",
    });

    await Promise.all([
      thread.members.add(user.id),
      QuestLogChannel.save({
        user,
        channel: Channel.create({
          id: thread.id,
          type: "QUEST_LOG_THREAD",
        }),
      }),
    ]);

    this.populate(thread, user);

    return thread;
  }

  static async computeState(
    user: User,
    expanded: QuestSymbol[] = []
  ): Promise<QuestLogMessage[]> {
    return Promise.all(
      this.quests.map(async (q) => {
        const e = expanded.includes(q.symbol);
        return {
          meta: { quest: q.symbol, expanded: e },
          data: await q.message(user, e),
        };
      })
    );
  }

  static async populate(thread: ThreadChannel, user: User) {
    const state = await this.computeState(user);
    await this.reconcile(thread, [], state);
  }

  static async toggle(userId: User["id"], quest: QuestSymbol) {
    const c = await QuestLogChannel.findOneOrFail({
      where: { user: { id: userId } },
      relations: ["user", "user.achievements"],
    });

    const next = cloneDeep(c.state);
    const q = next.find((m) => m.meta.quest === quest);

    if (!q) {
      throw new Error(`Quest ${q} not found.`);
    }

    q.meta.expanded = !q.meta.expanded;
    const qo = this.quests.find((qo) => qo.symbol === q.meta.quest);

    if (!qo) {
      throw new Error(`Quest ${qo} not found.`);
    }

    q.data = await qo.message(c.user, q.meta.expanded);

    const thread = await Utils.Thread.getOrFail(c.channel.id);
    await this.reconcile(thread, c.state, next);
  }

  static async reconcile(
    thread: ThreadChannel,
    prev: QuestLogState,
    next: QuestLogState
  ) {
    const qlc = await QuestLogChannel.findOneOrFail({
      where: { channel: { id: thread.id } },
      relations: ["channel"],
    });

    // Check order/count
    if (
      !equal(
        prev.map((m) => m.meta.quest),
        next.map((m) => m.meta.quest)
      )
    ) {
      await Promise.all(
        prev.map(async (_, idx) => {
          const dm = await thread.messages.fetch(qlc.messages[idx]);
          await dm.delete();
        })
      );

      const messages = await Promise.all(next.map((m) => thread.send(m.data)));
      qlc.messages = messages.map((m) => m.id);
    } else {
      // We know that prev/next are same size and order
      // Diff
      const updated = next.filter(
        // stringify & parse as state gets serialized when inserting into database
        // some discord.js objects define a toJSON(), which this calls
        (m, idx) => !equal(JSON.parse(JSON.stringify(m)), prev[idx])
      );

      if (updated.length) {
        await Promise.all(
          updated.map(async (m) => {
            const idx = next.findIndex((p) => equal(p, m));
            const dm = await thread.messages.fetch(qlc.messages[idx]);
            await dm.edit(m.data);
          })
        );
      }
    }

    qlc.state = next;
    await qlc.save();
  }

  static async purge(thread: ThreadChannel) {
    const c = await QuestLogChannel.findOneOrFail({
      where: { channel: { id: thread.id } },
      relations: ["channel"],
    });

    await c.remove();
    await c.channel.remove();

    try {
      await thread.delete();
    } catch (e) {}
  }

  static async refresh(user?: User) {
    if (!user) {
      await this.refreshAll();
      return;
    }

    await this.refreshUser(user);
  }

  static async refreshAll() {
    const qlcs = await QuestLogChannel.find({
      relations: ["user", "user.achievements"],
    });
    await Promise.all(qlcs.map((qlc) => this.refreshOne(qlc)));
  }

  static async refreshOne(qlc: QuestLogChannel) {
    const [next, thread] = await Promise.all([
      this.computeState(qlc.user),
      Utils.Thread.getOrFail(qlc.channel.id),
    ]);
    this.reconcile(thread, qlc.state, next);
  }

  static async refreshUser(user: User) {
    const qlc = await QuestLogChannel.findOne({
      where: { user: { id: user.id } },
      relations: ["user", "user.achievements"],
    });

    if (qlc) {
      await this.refreshOne(qlc);
    }
  }
}
