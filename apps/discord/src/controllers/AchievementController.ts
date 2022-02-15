import { MessageEmbed } from "discord.js";
import { AdminBot } from "../bots";
import { addAchievement, transactBalance } from "../legacy/db";
import { Achievement, User } from "../legacy/types";
import { currency } from "../legacy/utils";

export default class AchievementController {
  static descriptions: Record<Achievement, string> = {
    JOINED_THE_DEGENZ: "You took the `/redpill` and joined the Degenz army.",
    HELP_REQUESTED: "You used the `/help` command.",
    STATS_CHECKED: "You used the `/stats` command.",
    SUPER_OBEDIENT: "You typed the `/obey` command twice. Such a good citizen.",
  };

  static async award(user: User, achievement: Achievement, admin: AdminBot) {
    if (user.achievements.includes(achievement)) {
      return;
    }

    const apartment = await admin.getTextChannel(user.tenancies![0].propertyId);
    const member = await admin.getMember(user.id);

    await Promise.all([
      transactBalance(user.id, 10),
      addAchievement(user.id, achievement),
    ]);

    let embed = new MessageEmbed()
      .setAuthor({
        iconURL: member.displayAvatarURL(),
        name: member.displayName,
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

    await apartment.send({ embeds: [embed] });
  }
}
