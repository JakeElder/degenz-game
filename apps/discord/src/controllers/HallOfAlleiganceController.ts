import { channelMention, userMention } from "@discordjs/builders";
import Config from "app-config";
import { AppState, District, Pledge, User } from "db";
import {
  ButtonInteraction,
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import { LessThan, MoreThan } from "typeorm";
import { DateTime } from "luxon";
import { Global } from "../Global";
import { Format } from "lib";

export default class HallOfAlleiganceController {
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
    const bb = Global.bot("BIG_BROTHER");

    const state = await AppState.findOneOrFail();
    const c = await bb.getTextChannel(Config.channelId("HALL_OF_ALLEIGANCE"));

    let message: Message;
    let isNew = false;

    const s = await this.makePledgeMessage();

    const makeNew = async () => {
      isNew = true;
      return c.send(s);
    };

    if (!state.pledgeMessageId) {
      message = await makeNew();
    } else {
      try {
        message = await c.messages.fetch(state.pledgeMessageId);
        await message.edit(s);
      } catch (e) {
        message = await makeNew();
      }
    }

    if (isNew) {
      await AppState.setPledgeMessageId(message.id);
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
      where: { discordId: i.user.id },
      relations: ["tenancies", "tenancies.district"],
    });

    const pledge = await Pledge.findOne({
      where: { user },
      order: { createdAt: -1 },
    });

    const mostRecent = DateTime.fromJSDate(pledge!.createdAt);

    const entitledAllowance = user.primaryTenancy.district.allowance;

    const secondsSinceLastPledge = mostRecent
      .diffNow(["seconds"])
      .toObject().seconds;

    // const secondsInADay = 1 * 60 * 60 * 24;

    await i.reply({
      content: `\`\`\`${JSON.stringify(
        {
          highestDistrict: user.primaryTenancy.district.symbol,
          entitledAllowance,
          secondsSinceLastPledge,
          yield: pledge!.yield,
        },
        null,
        2
      )}\`\`\``,
      ephemeral: true,
    });
  }
}
