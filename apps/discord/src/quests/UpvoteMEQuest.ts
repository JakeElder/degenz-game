import { channelMention, roleMention } from "@discordjs/builders";
import Config from "config";
import { User } from "data/db";
import Quest from "../Quest";
import Utils from "../Utils";

export default class UpvoteMEQuest extends Quest {
  constructor() {
    super();

    const proofChannel = channelMention(
      Config.channelId("QUEST_COMPLETION_PROOF")
    );

    this.symbol = "UPVOTE_MAGIC_EDEN";
    this.instructions = [
      `**Go to** https://magiceden.io/drops/degenz_game`,
      `Press the **UPVOTE** button`,
      `Post proof in ${proofChannel}`,
    ];
  }

  async getProgress(user: User) {
    const progress: number = user.hasAchievement(
      "UPVOTE_MAGIC_EDEN_QUEST_COMPLETED"
    )
      ? 1
      : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    const doge = Config.emojiCode("DOGE");
    const gbt = Config.emojiCode("GBT_COIN");
    const role = roleMention(Config.roleId("MAGIC_EDEN_UPVOTER"));
    const dailyChannel = channelMention(Config.channelId("HALL_OF_ALLEIGANCE"));

    return this.format({
      title: "👆 Upvote on Magic Eden",
      thumbnail: `https://bucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com/public/images/af823939-14fa-4f90-a05f-535c313b8749_800x800.png`,
      progress,
      expanded,
      userId: user.id,
      bonus: {
        name: "💎 Bonus!",
        value:
          `${doge} ${role} Role!\n` +
          `${gbt} Extra 50 **$GBT** in ${dailyChannel} every day`,
      },
    });
  }
}
