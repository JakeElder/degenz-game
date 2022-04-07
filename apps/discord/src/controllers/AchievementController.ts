import { MessageEmbed } from "discord.js";
import { User, Achievement } from "data/db";
import { Achievement as AchievementEnum } from "data/types";
import { Global } from "../Global";
import Events from "../Events";
import { Format } from "lib";
import QuestLogController from "./QuestLogController";

export default class AchievementController {
  static descriptions: Record<AchievementEnum, string> = {
    JOINED_THE_DEGENZ: "You took the `/redpill` and joined the Degenz army.",
    HELP_REQUESTED: "You used the `/help` command.",
    STATS_CHECKED: "You used the `/stats` command.",
    SUPER_OBEDIENT: "You typed the `/obey` command twice. Such a good citizen.",
    ALLEGIANCE_PLEDGED: "You pledged your allegiance to Big Brother.",
    TOSS_COMPLETED: "You gambled at Teds Toss House",
    FINISHED_TRAINER: "-",
    MART_ITEM_BOUGHT: "-",
    MART_STOCK_CHECKED: "-",
  };

  static async checkAndAward(user: User, achievement: AchievementEnum) {
    if (!user.hasAchievement(achievement)) {
      await this.award(user, achievement);
      QuestLogController.refresh(user);
    }
  }

  static async award(user: User, achievement: AchievementEnum) {
    const admin = Global.bot("ADMIN");

    if (user.hasAchievement(achievement)) {
      return;
    }

    const [residence, member, achievementData] = await Promise.all([
      admin.getTextChannel(user.notificationChannelId),
      admin.guild.members.fetch(user.discordId),
      Achievement.findOne({ where: { symbol: achievement } }),
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

    if (achievement === AchievementEnum.JOINED_THE_DEGENZ) {
      embed = embed.setImage(
        "https://s10.gifyu.com/images/HeaderCryptoDegenz-min.gif"
      );
    }

    await residence.send({ embeds: [embed] });
    Events.emit("ACHIEVEMENT_AWARDED", { user, achievement });
  }
}
