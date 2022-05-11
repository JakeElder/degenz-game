import { MessageEmbed } from "discord.js";
import { User, Achievement } from "data/db";
import { Global } from "../Global";
import Events from "../Events";
import { Format } from "lib";
import { AchievementSymbol, QuestSymbol } from "data/types";
import Utils from "../Utils";

export default class AchievementController {
  static descriptions: Record<AchievementSymbol, string> = {
    JOIN_THE_DEGENZ_QUEST_COMPLETED:
      "You took the `/redpill` and joined the Degenz army.",
    PLEDGE_QUEST_COMPLETED: "You pledged your allegiance to Big Brother.",
    TOSS_WITH_TED_QUEST_COMPLETED: "You gambled at Teds Toss House",
    LEARN_TO_HACKER_BATTLE_QUEST_COMPLETED: "-",
    GET_WHITELIST_QUEST_COMPLETED: "-",
    SHOP_AT_MERRIS_MART_QUEST_COMPLETED: "-",
    FINISHED_TRAINER: "-",
    HELP_REQUESTED: "You used the `/help` command.",
    STATS_CHECKED: "You used the `/stats` command.",
    LEVEL_10_REACHED: "You reached Level 10!",
    LEVEL_8_REACHED: "You reached Level 8!",
    LEVEL_6_REACHED: "You reached Level 6!",
    LEVEL_4_REACHED: "You reached Level 4!",
    LEVEL_2_REACHED: "You reached Level 2!",
  };

  static async checkAndAward(user: User, achievement: AchievementSymbol) {
    if (!user.hasAchievement(achievement)) {
      await this.award(user, achievement);
    }
  }

  static async award(user: User, achievement: AchievementSymbol) {
    const admin = Global.bot("ADMIN");

    if (user.hasAchievement(achievement)) {
      return;
    }

    const [residence, member, achievementData] = await Promise.all([
      Utils.Channel.getOrFail(user.notificationChannelId),
      admin.guild.members.fetch(user.id),
      Achievement.findOne({ where: { id: achievement } }),
    ]);

    if (!achievementData) {
      throw new Error(`Achievement ${achievement} not found`);
    }

    if (!member) {
      throw new Error(`Member ${user.displayName} not found`);
    }

    const startBalance = user.gbt;

    user.achievements.push(achievementData);
    user.gbt += achievementData.reward;
    await user.save();

    let embed = new MessageEmbed()
      .setAuthor({
        iconURL: member.displayAvatarURL(),
        name: member.displayName,
      })
      .setTitle("Achievement Unlocked!")
      .setDescription(`\`${achievement}\``)
      .setColor("GOLD")
      .addField(
        "Reward",
        Format.transaction(startBalance, achievementData.reward)
      );

    if (achievement === "JOIN_THE_DEGENZ_QUEST_COMPLETED") {
      embed = embed.setImage(
        "https://s10.gifyu.com/images/HeaderCryptoDegenz-min.gif"
      );
    }

    await residence.send({ embeds: [embed] });
    const isQuest = achievement.endsWith("QUEST_COMPLETED");

    if (isQuest) {
      Events.emit("QUEST_COMPLETED", {
        user,
        quest: achievement.replace(/_QUEST_COMPLETED$/, "") as QuestSymbol,
        achievement: achievementData,
      });
    }

    Events.emit("ACHIEVEMENT_AWARDED", {
      user,
      achievement: achievementData,
      isQuest,
    });
  }
}
