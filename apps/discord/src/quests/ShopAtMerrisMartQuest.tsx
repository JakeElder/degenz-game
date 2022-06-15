import { channelMention } from "@discordjs/builders";
import Config from "config";
import { User } from "data/db";
import Quest from "../Quest";

export default class ShopAtMerrisMartQuest extends Quest {
  constructor() {
    super();
    this.symbol = "SHOP_AT_MERRIS_MART";
    const [rat, pizza, noodles] = Config.emojiCodes(
      "NUU_PING",
      "FAT_PIZZA",
      "DEGENZ_RAMEN"
    );

    this.instructions = [
      `**Go to** ${channelMention(Config.channelId("MART"))}`,
      `Type the \`/buy\` command to see what's in stock`,
      `Buy something ${rat} ${pizza} ${noodles}`,
    ];
  }

  async getProgress(user: User) {
    let progress: number = user.hasAchievement(
      "SHOP_AT_MERRIS_MART_QUEST_COMPLETED"
    )
      ? 1
      : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    return this.format({
      title: "Shop at Merris Mart",
      thumbnail: `https://s10.gifyu.com/images/ezgif.com-gif-maker-173287457657b663d733b17e847a410d21.gif`,
      progress,
      expanded,
      userId: user.id,
    });
  }
}
