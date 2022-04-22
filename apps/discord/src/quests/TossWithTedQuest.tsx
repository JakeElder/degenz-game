import { channelMention } from "@discordjs/builders";
import Config from "config";
import { User } from "data/db";
import Quest from "../Quest";

export default class TossWithTedQuest extends Quest {
  constructor() {
    super();
    this.symbol = "TOSS_WITH_TED";
    this.instructions = [
      `**Go to** ${channelMention(Config.channelId("TOSS_HOUSE"))}`,
      `Type the \`/toss\` command to gamble`,
    ];
  }

  async getProgress(user: User) {
    let progress: number = user.hasAchievement("TOSS_WITH_TED_QUEST_COMPLETED")
      ? 1
      : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    return this.format({
      title: "Toss with Ted",
      thumbnail: `${Config.env("WEB_URL")}/characters/npcs/TOSSER.png`,
      progress,
      expanded,
      userDiscordId: user.id,
    });
  }
}
