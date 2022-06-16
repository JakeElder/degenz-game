import { channelMention, roleMention } from "@discordjs/builders";
import Config from "config";
import { User } from "data/db";
import Quest from "../Quest";

export default class RepTheDegenzQuest extends Quest {
  constructor() {
    super();

    const proofChannel = channelMention(
      Config.channelId("QUEST_COMPLETION_PROOF")
    );

    this.symbol = "REP_THE_DEGENZ";
    this.instructions = [
      `**Go to** ${channelMention(Config.channelId("GET_PFP"))}`,
      `Press the **Get PFP** button`,
      `Use as your *Discord* and *Twitter* PFP`,
      `Post proof in ${proofChannel}`,
    ];
  }

  async getProgress(user: User) {
    const progress: number = user.hasAchievement(
      "REP_THE_DEGENZ_QUEST_COMPLETED"
    )
      ? 1
      : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    const degen = Config.emojiCode("DEGEN");
    const gbt = Config.emojiCode("GBT_COIN");
    const role = roleMention(Config.roleId("DEGEN_SQUAD"));
    const dailyChannel = channelMention(Config.channelId("HALL_OF_ALLEIGANCE"));

    return this.format({
      title: "✊ Rep The Degenz",
      thumbnail: `https://stage.degenz.game/degenz-game-character-preview.gif`,
      progress,
      expanded,
      userId: user.id,
      bonus: {
        name: "Bonus",
        value:
          `${degen} ${role} Role!\n` +
          `${gbt} Extra 100 **$GBT** in ${dailyChannel} every day`,
      },
    });
  }
}
