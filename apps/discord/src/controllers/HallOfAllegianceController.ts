import { channelMention, roleMention } from "@discordjs/builders";
import Config from "config";
import { District, Dormitory, Pledge, User } from "data/db";
import {
  ButtonInteraction,
  InteractionCollector,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
  MessageOptions,
} from "discord.js";
import { Format } from "lib";
import { DateTime } from "luxon";
import pluralize from "pluralize";
import Events from "../Events";
import AchievementController from "./AchievementController";
import { PersistentMessageController } from "./PersistentMessageController";

export default class HallOfAllegianceController {
  static buttonCollector: InteractionCollector<ButtonInteraction>;

  static async init() {
    await this.update();
  }

  static async update() {
    await this.setPledgeMessage();
  }

  static async makePledgeMessage(): Promise<MessageOptions> {
    const claim = new MessageButton()
      .setLabel("\u{1f4b0} PLEDGE TO CLAIM $GBT")
      .setStyle("SUCCESS")
      .setCustomId("claim");

    const upperAmount = Format.currency(250);
    const lowerAmount = Format.currency(180);

    const districts = await District.find({
      relations: ["tenancies"],
      order: { id: 1 },
    });

    const districtTable = districts
      .map((d) => {
        return `${d.emoji} : ${Format.currency(d.allowance)}`;
      })
      .join("\n");

    const doge = Config.emojiCode("DOGE");
    const role = roleMention(Config.roleId("MAGIC_EDEN_UPVOTER"));
    const questsChannel = channelMention(Config.channelId("QUESTS"));
    const dorms = await Dormitory.find();
    const gbt = Config.emojiCode("GBT_COIN");

    return {
      content: `THE STATE OF BEAUTOPIA is kind enough to issue with up to ${upperAmount} a day, based on your value in society.\nDepending on the highest residence you have access to, you will receive the follow amounts in a 24 hour period.`,
      embeds: [
        {
          author: {
            icon_url: "https://s10.gifyu.com/images/heads-coin-smaller.gif",
            name: "Residence Payouts",
          },
          description: `You will receive a **DAILY ALLOWANCE**, based on your position in Beautopia.\n\nAdditionally, completing certain quests from the ${questsChannel} will entitle you to **EXTRA** ${gbt} **$GBT**`,
          fields: [
            {
              name: "District Payouts",
              value: `${districtTable}\n${dorms
                .map((d) => d.emoji.toString())
                .join("")}: ${lowerAmount}`,
            },
            {
              name: "Role Payouts",
              value: `${doge} ${role}: **+** ${Format.currency(50)} per day.`,
            },
          ],
        },
      ],
      components: [new MessageActionRow().addComponents(claim)],
    };
  }

  static async setPledgeMessage() {
    const options = await this.makePledgeMessage();
    const message = await PersistentMessageController.set("PLEDGE", options);

    if (!message) {
      return;
    }

    if (this.buttonCollector) {
      this.buttonCollector.off("collect", this.handleButtonPress);
    }

    this.buttonCollector = message
      .createMessageComponentCollector({ componentType: "BUTTON" })
      .on("collect", this.handleButtonPress);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    const user = await User.findOneOrFail({
      where: { id: i.user.id },
      relations: [
        "apartmentTenancies",
        "apartmentTenancies.district",
        "achievements",
      ],
    });

    const pledge = await Pledge.findOne({
      where: { user: { id: i.user.id } },
      order: { createdAt: -1 },
    });

    const { dailyAllowance } = user.primaryTenancy;

    if (!pledge) {
      let yld = dailyAllowance;
      if (user.hasAchievement("UPVOTE_MAGIC_EDEN_QUEST_COMPLETED")) {
        yld += 50;
      }

      const tx = Format.transaction(user.gbt, yld);
      await HallOfAllegianceController.award(user, yld);

      await i.reply({
        embeds: [
          {
            title: "Pledge Accepted",
            color: "GREEN",
            description: `Your first Pledge, Comrade. **Congratulations** \u{1f389}\n\n${tx}`,
          },
        ],
        ephemeral: true,
      });

      await AchievementController.checkAndAward(user, "PLEDGE_QUEST_COMPLETED");

      return;
    }

    const mostRecent = DateTime.fromJSDate(pledge.createdAt);
    const now = DateTime.now();
    const daysPassed = now.diff(mostRecent, ["days"]).toObject().days!;
    const allowance = Math.floor(dailyAllowance * Math.min(daysPassed, 1));

    if (allowance < 1) {
      const claim = Format.currency(pledge.yld);
      const secondsPassed = Math.round(daysPassed * 24 * 60 * 60);
      const minutesPassed = Math.round(daysPassed * 24 * 60);

      const ago =
        secondsPassed < 60
          ? `${secondsPassed} ${pluralize("second", secondsPassed)}`
          : `${minutesPassed} ${pluralize("minute", minutesPassed)}`;

      const minimumMinutes = Math.ceil((24 * 60) / dailyAllowance);
      const wait = `${minimumMinutes} ${pluralize("minute", minimumMinutes)}`;

      await i.reply({
        embeds: [
          {
            title: "Pledge Rejected",
            color: "RED",
            description: `You claimed ${claim} **${ago} ago**.. You need to wait at least **${wait}** Comrade.`,
          },
        ],
        ephemeral: true,
      });
      return;
    }

    let yld = allowance;
    if (user.hasAchievement("UPVOTE_MAGIC_EDEN_QUEST_COMPLETED")) {
      const additional = Math.min(Math.floor(50 * Math.min(daysPassed, 1)), 50);
      yld += additional;
    }

    const tx = Format.transaction(user.gbt, yld);
    await HallOfAllegianceController.award(user, yld);

    const embeds: MessageEmbedOptions[] = [
      {
        title: "Pledge Accepted",
        color: "GREEN",
        description: `There's a good citizen. ${tx}`,
      },
    ];

    if (user.id === "720619989618393121") {
      embeds.push({
        color: "RED",
        description: `${Config.emojiCode(
          "BIG_BROTHER_NPC"
        )} we're watching you bob.`,
      });
    }

    await i.reply({ embeds, ephemeral: true });
  }

  static async award(user: User, yld: number) {
    user.gbt += yld;

    await Promise.all([
      user.save(),
      Pledge.insert({ user: { id: user.id }, yld }),
    ]);

    Events.emit("ALLEGIANCE_PLEDGED", { user, yld });
  }
}
