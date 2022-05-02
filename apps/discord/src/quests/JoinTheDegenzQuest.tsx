import { channelMention } from "@discordjs/builders";
import { User } from "data/db";
import { MessageButton } from "discord.js";
import Quest from "../Quest";

export default class JoinTheDegenzQuest extends Quest {
  constructor() {
    super();
    this.symbol = "JOIN_THE_DEGENZ";
    this.instructions = async (userId) => {
      const instructions: string[] = [];

      const onboardingChannel = await this.getOnboardingChannel(userId);

      if (onboardingChannel === null) {
        instructions.push(
          `**Press** the **START QUEST** button below`,
          `Go to the orientation channel`
        );
      } else {
        instructions.unshift(
          `**Go to** ${channelMention(onboardingChannel.id)}`
        );
      }

      instructions.push(`Follow the instructions`);

      return instructions;
    };
  }

  async getOnboardingChannel(userId: User["id"]) {
    const user = await User.findOneOrFail({ where: { id: userId } });
    return user.onboardingChannel;
  }

  async getProgress(user: User) {
    let progress: number = user.hasAchievement(
      "JOIN_THE_DEGENZ_QUEST_COMPLETED"
    )
      ? 1
      : 0;
    return progress;
  }

  async message(user: User, expanded: boolean) {
    const progress = await this.getProgress(user);
    const buttons: MessageButton[] = [];

    if (progress < 1 && expanded) {
      const onboardingChannel = await this.getOnboardingChannel(user.id);

      if (onboardingChannel === null) {
        buttons.push(
          new MessageButton()
            .setLabel("Start Quest")
            .setStyle("PRIMARY")
            .setCustomId(`START_QUEST:JOIN_THE_DEGENZ:${user.id}`)
        );
      }
    }

    const message = await this.format({
      title: "Join the Degenz",
      thumbnail: `https://s10.gifyu.com/images/header-smaller-1.gif`,
      progress,
      expanded,
      userId: user.id,
      buttons,
    });

    return message;
  }
}
