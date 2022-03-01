import { District, Pledge, User } from "data/db";
import {
  ButtonInteraction,
  InteractionCollector,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import { Format } from "lib";
import { DateTime } from "luxon";
import pluralize from "pluralize";
import Events from "../Events";
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

    const amount = Format.currency(150);

    const districts = await District.find({
      relations: ["tenancies"],
      order: { symbol: 1 },
    });

    const districtTable = districts
      .map((d) => {
        return `${d.activeEmoji} : ${Format.currency(d.allowance)}`;
      })
      .join("\n");

    return {
      content: `THE STATE OF BEAUTOPIA is kind enough to issue with up to ${amount} a day, based on your value in society.\nDepending on the highest district you have access to, you will receive the follow amounts in a 24 hour period.`,
      embeds: [
        {
          author: {
            iconURL: "https://s10.gifyu.com/images/tails-coin-smaller.gif",
            name: "District Payouts",
          },
          // title: ":cityscape:\u200b \u200bAvailable Apartments",
          description: `Beautopia is divided in to districts, 1 to 6. Every 24 hours you are eligible for a state allowance, awarded based on the highest district you have access to and your behaviour in Beautopia.\n\n${districtTable}`,
          footer: {
            // iconURL: bb.client.user!.displayAvatarURL(),
            text: "Press the Pledge button to pledge your alleigance to the state.",
          },
        },
      ],
      components: [new MessageActionRow().addComponents(claim)],
    };
  }

  static async setPledgeMessage() {
    const options = await this.makePledgeMessage();
    const message = await PersistentMessageController.set("PLEDGE", options);

    if (this.buttonCollector) {
      this.buttonCollector.off("collect", this.handleButtonPress);
    }

    this.buttonCollector = message
      .createMessageComponentCollector({ componentType: "BUTTON" })
      .on("collect", this.handleButtonPress);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    const user = await User.findOneOrFail({
      where: { discordId: i.user.id },
      relations: ["tenancies", "tenancies.district"],
    });

    const pledge = await Pledge.findOne({
      where: { user },
      order: { createdAt: -1 },
    });

    const dailyAllowance = user.primaryTenancy.district.allowance;

    if (!pledge) {
      const tx = Format.transaction(user.gbt, dailyAllowance);
      await HallOfAllegianceController.award(user, dailyAllowance);
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

    const tx = Format.transaction(user.gbt, allowance);
    await HallOfAllegianceController.award(user, allowance);
    await i.reply({
      embeds: [
        {
          title: "Pledge Accepted",
          color: "GREEN",
          description: `There's a good citizen. ${tx}`,
        },
      ],
      ephemeral: true,
    });
  }

  static async award(user: User, yld: number) {
    user.gbt += yld;
    await Promise.all([user.save(), Pledge.insert({ user, yld })]);
    Events.emit("ALLEGIANCE_PLEDGED", { user, yld });
  }
}
