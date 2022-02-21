import { capitalCase } from "change-case";
import { GuildMember, MessageButton, MessageEmbedOptions } from "discord.js";
import emoji from "node-emoji";
import { groupBy } from "lodash";
import { User, MartItem } from "db";

export function calculateTossRake(amount: number) {
  return Math.max(Math.ceil(amount * 0.02), 1);
}

export function makeButton(
  id: string,
  { disabled, selected }: { disabled: boolean; selected: boolean } = {
    disabled: false,
    selected: false,
  },
  label?: string
) {
  const checked = `${emoji.get("ballot_box_with_check")}\u2002`;
  label = selected
    ? `${checked}${label ? label : capitalCase(id)}`
    : label
    ? label
    : capitalCase(id);

  return new MessageButton()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(disabled ? "SECONDARY" : "PRIMARY")
    .setDisabled(disabled);
}

export function currency({
  plural = true,
  long = true,
  bold = true,
  copyright = true,
}: Partial<{
  plural: boolean;
  long: boolean;
  bold: boolean;
  copyright: boolean;
}> = {}) {
  let currency = long ? (plural ? "GoodBoyTokens" : "GoodBoyToken") : "$GBT";

  if (long && copyright) {
    currency = `${currency}${"\u24b8"}`;
  }

  if (bold) {
    currency = `**${currency}**`;
  }

  return currency;
}

const TROPHY = "\u{1f3c6}";

export function makeUserStatsEmbed(user: User, member: GuildMember) {
  const c = currency({ bold: false, copyright: false });

  let longestAchievementLength;

  if (user.achievements.length) {
    longestAchievementLength = [...user.achievements].sort(
      (a, b) => b.symbol.length - a.symbol.length
    )[0].symbol.length;
  } else {
    longestAchievementLength = 0;
  }

  const totalWidth = Math.max(longestAchievementLength + 2, 24);
  const barWidth = totalWidth - `|${user.strength}`.length;
  const fullPercentage = user.strength;
  const emptyPercentage = 100 - user.strength;

  const fullChars = Math.ceil(barWidth * (fullPercentage / 100));
  const emptyChars = Math.ceil(barWidth * (emptyPercentage / 100));

  const strengthBar =
    "\u2588".repeat(fullChars) + " ".repeat(emptyChars) + `|${user.strength}`;

  const m: MessageEmbedOptions = {
    color: member.displayColor,
    author: {
      name: member.displayName,
      iconURL: member.displayAvatarURL(),
    },
    description: "`Level 1 Degen`",
    fields: [
      { name: c, value: `\`\`\`${user.gbt.toLocaleString()}\`\`\`` },
      { name: "Strength", value: `\`\`\`${strengthBar}\`\`\`` },
      {
        name: "Achievements",
        value: `\`\`\`${user.achievements
          .map((a) => `${TROPHY} ${a.symbol}`)
          .join("\n")}\`\`\``,
      },
    ],
  };

  return m;
}

export function makeInventoryEmbed(
  items: MartItem[],
  user: User,
  member: GuildMember
) {
  const groups = groupBy(user.martItemOwnerships, "item.symbol");

  const longestItemName = [...items].sort(
    (a, b) => b.name.length - a.name.length
  )[0].name;

  const longestQuantity = [...items]
    .sort(
      (a, b) =>
        b.price.toLocaleString().length - a.price.toLocaleString().length
    )[0]
    .price.toLocaleString();

  const foods = [];

  for (let group of Object.keys(groups)) {
    const name = items.find((i) => i.symbol === group)!.name;
    const amount = groups[group].length.toLocaleString();
    foods.push(
      `${name.padEnd(`${longestItemName}   `.length)} | ${amount.padEnd(
        longestQuantity.length,
        " "
      )}`
    );
  }

  const width = Math.max(
    `${longestItemName}   | ${longestQuantity} `.length,
    30
  );

  if (foods.length === 0) {
    const message = "-- no food --";
    foods.push(
      `${message
        .padStart((width - message.length) / 2 + message.length, " ")
        .padEnd(width - message.length + message.length, " ")}`
    );
  }

  const message = "-- coming soon --";
  const i = `\`\`\`${message
    .padStart((width - message.length) / 2 + message.length, " ")
    .padEnd(width - message.length + message.length, " ")}\`\`\``;

  const m: MessageEmbedOptions = {
    color: member.displayColor,
    author: {
      name: member.displayName,
      iconURL: member.displayAvatarURL(),
    },
    title: "Inventory",
    fields: [
      {
        name: "Food",
        value: `\`\`\`${foods.join("\n")}\`\`\``,
      },
      {
        name: "Items",
        value: i,
      },
    ],
  };

  return m;
}

export function makeLeaderboardEmbed(users: User[]): MessageEmbedOptions {
  if (users.length === 0) {
    return {
      description: "no users",
    };
  }

  const longestNameLength = [...users].sort((a, b) => {
    return b.displayName.length - a.displayName.length;
  })[0].displayName.length;

  const highestTokensLength = [...users]
    .sort((a, b) => b.gbt - a.gbt)[0]
    .gbt.toLocaleString().length;

  const TKN = currency({ long: false, bold: false });

  const positionWidth = 5;
  const pad = 4;
  const WIDTH =
    positionWidth +
    longestNameLength +
    pad +
    "| ".length +
    highestTokensLength +
    1 +
    ` ${TKN}`.length;

  const format = (number: number, name: string, tokens: number) => {
    let row = " ";
    row += number.toString().padStart(2, " ");
    row += ". ";
    row += name;
    row += " ".repeat(longestNameLength - name.length + pad);
    row += "| ";
    row += `${tokens.toLocaleString()} ${TKN}`.padStart(
      highestTokensLength + ` ${TKN}`.length
    );
    row += " ";
    return row;
  };

  const title = "LEADERS";
  const headerPad = " ".repeat((WIDTH - title.length) / 2);
  const header = `${headerPad}${title}${headerPad}`;

  const t = [
    `${header}`,
    ` ${"-".repeat(WIDTH - 2)} `,
    ...users.map((l, idx) => format(idx + 1, l.displayName, l.gbt)),
  ];

  const m: MessageEmbedOptions = {
    description: `\`\`\`${t.map((l) => `${l}`).join("\n")}\`\`\``,
    color: "GOLD",
  };

  return m;
}
