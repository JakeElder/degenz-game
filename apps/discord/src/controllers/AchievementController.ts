import { MessageEmbed } from "discord.js";
import { User } from "data/db";
import { Achievement } from "data/types";
import { addAchievement, transactBalance } from "../legacy/db";
import { currency } from "../legacy/utils";
import { Global } from "../Global";
import Events from "../Events";

export default class AchievementController {
  static descriptions: Record<Achievement, string> = {
    JOINED_THE_DEGENZ: "You took the `/redpill` and joined the Degenz army.",
    HELP_REQUESTED: "You used the `/help` command.",
    STATS_CHECKED: "You used the `/stats` command.",
    SUPER_OBEDIENT: "You typed the `/obey` command twice. Such a good citizen.",
    FINISHED_TRAINER: "-",
    MART_ITEM_BOUGHT: "-",
    MART_STOCK_CHECKED: "-",
  };

  static async award(user: User, achievement: Achievement) {
    const admin = Global.bot("ADMIN");

    if (user.hasAchievement(achievement)) {
      return;
    }

    const residence = await admin.getTextChannel(user.notificationChannelId);
    const member = await admin.getMember(user.discordId);

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
      .setDescription(AchievementController.descriptions[achievement])
      .setColor("GOLD")
      .addField("Achievement", achievement)
      .addField(
        "Reward",
        `10 ${currency()} have been deposited to your account`
      );

    if (achievement === Achievement.JOINED_THE_DEGENZ) {
      embed = embed.setImage(
        "https://s10.gifyu.com/images/HeaderCryptoDegenz-min.gif"
      );
    }

    await residence.send({ embeds: [embed] });
    Events.emit("ACHIEVEMENT_AWARDED", { user, achievement });
  }
}
