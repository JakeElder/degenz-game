import { channelMention } from "@discordjs/builders";
import Config from "config";
import { MartItemOwnership, User } from "data/db";
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
    const items = await MartItemOwnership.count({
      where: { user: { id: user.id } },
      withDeleted: true,
    });

    let progress: number = items > 0 ? 1 : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    return this.format({
      title: "Shop at Merris Mart",
      thumbnail: `${Config.env("WEB_URL")}/characters/npcs/MART_CLERK.png`,
      progress,
      expanded,
      userDiscordId: user.id,
    });
  }
}
