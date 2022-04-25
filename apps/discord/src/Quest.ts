import { QuestSymbol } from "data/types";
import {
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
  MessageOptions,
  Util,
} from "discord.js";
import { Achievement, User } from "data/db";
import Config from "config";

type FormatProps = {
  title: string;
  thumbnail: string;
  progress: number;
  userId: GuildMember["id"];
  expanded: boolean;
  buttons?: MessageButton[];
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
    const { title, thumbnail, progress, userId, expanded, buttons } = props;

    const complete = progress === 1;
    const button = this.makeToggleButton({ userId, expanded });
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
            value: `${await this.reward()}`,
            inline: true,
          },
        ],
        image: { url: `${Config.env("WEB_URL")}/blank-row.png` },
      },
    ];

    if (expanded) {
      const emojis = [
        "\u0031\ufe0f\u20e3",
        "\u0032\ufe0f\u20e3",
        "\u0033\ufe0f\u20e3",
        "\u0034\ufe0f\u20e3",
        "\u0035\ufe0f\u20e3",
        "\u0036\ufe0f\u20e3",
        "\u0037\ufe0f\u20e3",
        "\u0038\ufe0f\u20e3",
        "\u0039\ufe0f\u20e3",
      ];

      const instructions =
        typeof this.instructions === "function"
          ? await this.instructions(userId)
          : this.instructions;

      embeds.push({
        description: instructions
          .map((i, idx) => `${emojis[idx]}\u2007${i}`)
          .join("\n"),
      });
    }

    const row = new MessageActionRow();
    row.addComponents(button, ...(buttons || []));

    return { embeds, components: [row] };
  }

  async reward() {
    const achievement = await Achievement.findOneOrFail({
      where: { id: `${this.symbol}_QUEST_COMPLETED` },
    });
    return achievement.reward;
  }
}
