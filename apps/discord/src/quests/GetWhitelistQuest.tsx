import { channelMention } from "@discordjs/builders";
import Config from "config";
import { User } from "data/db";
import { Global } from "../Global";
import Quest from "../Quest";

export default class GetWhitelistQuest extends Quest {
  constructor() {
    super();
    this.symbol = "GET_WHITELIST";
    this.instructions = [
      `**Go to** the ${channelMention(Config.channelId("WHITELIST"))} channel`,
      `Press the **Give Me Whitelist** button`,
      `Follow the instructions there!`,
    ];
  }

  async getProgress(user: User) {
    const admin = Global.bot("ADMIN");
    const member = await admin.guild.members.fetch(user.id);
    if (!member) {
      throw new Error(`Member ${user.displayName} not found`);
    }
    let progress: number = member.roles.cache.has(Config.roleId("WHITELIST"))
      ? 1
      : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);

    return this.format({
      title: "Get Whitelist",
      thumbnail: `https://s10.gifyu.com/images/Card-5x-rotateae82817b5fcc197d.png`,
      progress,
      expanded,
      userId: user.id,
    });
  }
}
