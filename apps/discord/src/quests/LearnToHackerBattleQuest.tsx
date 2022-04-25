import { channelMention, userMention } from "@discordjs/builders";
import Config from "config";
import { User } from "data/db";
import Quest from "../Quest";

export default class LearnToHackerBattleQuest extends Quest {
  constructor() {
    super();
    this.symbol = "LEARN_TO_HACKER_BATTLE";
    this.instructions = [
      `**Go to** ${channelMention(Config.channelId("TRAINING_DOJO"))}`,
      `Press the **LFG** button`,
      `**Follow** ${userMention(
        Config.clientId("SENSEI")
      )}'s **instructions**.`,
    ];
  }

  async getProgress(user: User) {
    let progress: number = user.hasAchievement("FINISHED_TRAINER") ? 1 : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    return this.format({
      title: "Learn to Hacker Battle",
      thumbnail: `https://s10.gifyu.com/images/Mind-Control-Degenz-V2-min.gif`,
      progress,
      expanded,
      userId: user.id,
    });
  }
}
