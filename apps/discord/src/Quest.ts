import { QuestSymbol } from "data/types";
import {
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
  MessageOptions,
  Util,
} from "discord.js";
import { User } from "data/db";
import Config from "config";
import { Format } from "lib";

type FormatProps = {
  title: string;
  thumbnail: string;
  progress: number;
  userDiscordId: GuildMember["id"];
  expanded: boolean;
};

export default abstract class Quest {
  symbol: QuestSymbol;
  instructions: string[];

  abstract message(user: User, expanded: boolean): Promise<MessageOptions>;
  abstract getProgress(user: User): Promise<number>;

  makeToggleButton({
    userDiscordId,
    expanded,
  }: {
    userDiscordId: GuildMember["id"];
    expanded: boolean;
  }) {
    return new MessageButton()
      .setLabel(expanded ? "Hide Details" : "Show Details")
      .setStyle("SECONDARY")
      .setCustomId(`TOGGLE_QUEST_DETAILS:${this.symbol}:${userDiscordId}`);
  }

  format(props: FormatProps): MessageOptions {
    const { title, thumbnail, progress, userDiscordId, expanded } = props;

    const complete = progress === 1;
    const button = this.makeToggleButton({
      userDiscordId,
      expanded,
    });
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
            value: Format.currency(100),
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

      embeds.push({
        description: this.instructions
          .map((i, idx) => `${emojis[idx]}\u2007${i}`)
          .join("\n"),
      });
    }

    return {
      embeds,
      components: [new MessageActionRow().addComponents(button)],
    };
  }
}
