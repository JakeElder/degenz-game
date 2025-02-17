import { QuestSymbol, SingleDigitNumber } from "data/types";
import {
  EmbedFieldData,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
  MessageOptions,
  Util,
} from "discord.js";
import { Achievement, User } from "data/db";
import Config from "config";
import { Format } from "lib";
import Utils from "./Utils";

type FormatProps = {
  title: string;
  thumbnail: string;
  progress: number;
  userId: GuildMember["id"];
  expanded: boolean;
  buttons?: MessageButton[];
  bonus?: EmbedFieldData;
};

export default abstract class Quest {
  symbol: QuestSymbol;
  instructions: string[] | ((userId: User["id"]) => Promise<string[]>);

  abstract message(user: User, expanded: boolean): Promise<MessageOptions>;
  abstract getProgress(user: User): Promise<number>;

  makeToggleButton({
    userId,
    expanded,
  }: {
    userId: GuildMember["id"];
    expanded: boolean;
  }) {
    return new MessageButton()
      .setLabel(expanded ? "Hide Details" : "Show Details")
      .setStyle("SECONDARY")
      .setCustomId(`TOGGLE_QUEST_DETAILS:${this.symbol}:${userId}`);
  }

  async format(props: FormatProps): Promise<MessageOptions> {
    const { title, thumbnail, progress, userId, expanded, buttons, bonus } =
      props;

    const complete = progress === 1;
    const color = complete
      ? Util.resolveColor("DARK_GREEN")
      : Util.resolveColor("NOT_QUITE_BLACK");

    const embeds: MessageEmbedOptions[] = [
      {
        thumbnail: { url: thumbnail },
        color,
        title,
        fields: [
          {
            name: "Progress",
            value: complete ? "🏅 Complete" : "▫️ Incomplete",
            inline: true,
          },
          {
            name: "Reward",
            value: Format.currency(await this.reward()),
            inline: true,
          },
          ...(bonus ? [bonus] : []),
        ],
        image: { url: `${Config.env("WEB_URL")}/blank-row.png` },
      },
    ];

    if (progress < 1 && expanded) {
      const instructions =
        typeof this.instructions === "function"
          ? await this.instructions(userId)
          : this.instructions;

      embeds.push({
        description: instructions
          .map(
            (i, idx) =>
              `${Utils.numberEmoji(idx as SingleDigitNumber)}\u2007${i}`
          )
          .join("\n"),
      });
    }

    let components: MessageActionRow[] = [];

    if (progress < 1) {
      const button = this.makeToggleButton({ userId, expanded });
      components.push(
        new MessageActionRow().addComponents(button, ...(buttons || []))
      );
    } else {
      const button = new MessageButton()
        .setLabel("Quest Completed!")
        .setStyle("SECONDARY")
        .setDisabled(true)
        .setCustomId(`QUEST_COMPLETED:${this.symbol}:${userId}`);

      components.push(new MessageActionRow().addComponents(button));
    }

    return { embeds, components };
  }

  async reward() {
    const achievement = await Achievement.findOneOrFail({
      where: { id: `${this.symbol}_QUEST_COMPLETED` },
    });
    return achievement.reward;
  }
}
