import { channelMention } from "@discordjs/builders";
import Config from "config";
import { Pledge, User } from "data/db";
import Quest from "../Quest";

export default class PledgeQuest extends Quest {
  constructor() {
    super();
    this.symbol = "PLEDGE";
    this.instructions = [
      `**Go to** ${channelMention(Config.channelId("HALL_OF_ALLEIGANCE"))}`,
      `Press the **PLEDGE TO CLAIM $GBT** button`,
      `**Profit** ${Config.emojiCode("GBT_COIN")}`,
    ];
  }

  async getProgress(user: User) {
    const pledges = await Pledge.count({ where: { user: { id: user.id } } });
    const progress: number = pledges > 0 ? 1 : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    return this.format({
      title: "Pledge Allegiance to Big Brother",
      thumbnail: `${Config.env("WEB_URL")}/characters/npcs/BIG_BROTHER.png`,
      progress,
      expanded,
      userId: user.id,
    });
  }
}
