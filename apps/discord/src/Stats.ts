import { GuildMember, MessageEmbedOptions } from "discord.js";
import { getBorderCharacters, table } from "table";
import random from "random";
import Config from "config";
import { Format } from "lib";

export type StatsViewModel = {
  member: GuildMember;
  imageURL: string;
  strength: number;
  level: number;
  attributes: {
    strength: string | number;
    luck: string | number;
    charisma: string | number;
  };
};

class Stats {
  static makeStrengthBar(strength: number, width: number = 34) {
    const s = [
      [
        "\u2588".repeat((width - 4) * (strength / 100)),
        `|${strength.toString().padStart(3, " ")}`,
      ],
    ];

    const bar = table(s, {
      border: getBorderCharacters("void"),
      columnDefault: { paddingLeft: 0, paddingRight: 0 },
      drawHorizontalLine: () => false,
      columns: [{ width: width - 4 }, { width: 4 }],
    });

    return bar;
  }

  static get randomColourImage() {
    const image = `${random.int(1, 35).toString().padStart(4, "0")}.png`;
    return `${Config.env("WEB_URL")}/characters/colour/${image}`;
  }

  static makeEmbed(model: StatsViewModel): MessageEmbedOptions {
    const color =
      model.strength > 80 ? "GREEN" : model.strength > 30 ? "ORANGE" : "RED";

    return {
      color,
      image: {
        url: model.imageURL,
        height: 680,
        width: 680,
      },
      author: {
        name: model.member.displayName,
        icon_url: model.member.displayAvatarURL(),
      },
      description: `\`Level ${model.level} Degen\``,
      fields: [
        {
          name: Format.currency(null, { full: true, plural: true }),
          value: Format.codeBlock(
            Format.currency(random.int(0, 3000), { bare: true })
          ),
        },
        {
          name: "Strength",
          value: Format.codeBlock(Stats.makeStrengthBar(model.strength)),
        },
        {
          name: "Attributes",
          value: Format.codeBlock(this.makeAttributes(model)),
        },
        // {
        //   name: "Achievements",
        //   value: `\`\`\`${user.achievements
        //     .map((a) => `${TROPHY} ${a.symbol}`)
        //     .join("\n")}\`\`\``,
        // },
      ],
      footer: { text: `Rarity: ${random.int(1, 3333)}` },
    };
  }

  static makeAttributes(model: StatsViewModel, width: number = 34) {
    const { strength, luck, charisma } = model.attributes;

    // prettier-ignore
    const s = [
      ['Strength', 'Luck', 'Charisma'],
      [`+${strength}`, `+${luck}`, `+${charisma}`]
    ]

    const cw = 2;
    const wa = width - cw;

    const w0 = Math.ceil(wa / 3);
    const w2 = Math.ceil(wa / 3);
    const w1 = wa - (w0 + w2);

    const attributes = table(s, {
      columnDefault: { paddingLeft: 0, paddingRight: 0, alignment: "center" },
      drawVerticalLine: (idx) => [1, 2].includes(idx),
      columns: [
        { width: w0 },
        { width: w1, alignment: "center" },
        { width: w2 },
      ],
    });

    return attributes;
  }
}

export default Stats;
