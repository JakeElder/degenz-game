import { MessageEmbed } from "discord.js";
import { User } from "data/db";
import { Achievement } from "data/types";
import { addAchievement, transactBalance } from "../legacy/db";
import { Global } from "../Global";
import Events from "../Events";
import { Format } from "lib";
import QuestLogController from "./QuestLogController";

export default class AchievementController {
  static descriptions: Record<Achievement, string> = {
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

  static async checkAndAward(user: User, achievement: Achievement) {
    if (!user.hasAchievement(achievement)) {
      await this.award(user, achievement);
      QuestLogController.refresh(user);
    }
  }

  static async award(user: User, achievement: Achievement) {
    const admin = Global.bot("ADMIN");

    if (user.hasAchievement(achievement)) {
      return;
    }

    const residence = await admin.getTextChannel(user.notificationChannelId);
    const member = await admin.getMember(user.discordId);

    const startBalance = user.gbt;

    await Promise.all([
      transactBalance(user.discordId, 10),
      addAchievement(user.discordId, achievement),
    ]);

    let embed = new MessageEmbed()
      .setAuthor({
        iconURL: member!.displayAvatarURL(),
        name: member!.displayName,
      })
      .setTitle("Achievement Unlocked!")
      .setDescription(`\`${achievement}\``)
      .setColor("GOLD")
      .addField("Reward", Format.transaction(startBalance, 10));

    if (achievement === Achievement.JOINED_THE_DEGENZ) {
      embed = embed.setImage(
        "https://s10.gifyu.com/images/HeaderCryptoDegenz-min.gif"
      );
    }

    await residence.send({ embeds: [embed] });
    Events.emit("ACHIEVEMENT_AWARDED", { user, achievement });
  }
}
