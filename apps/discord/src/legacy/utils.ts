import { capitalCase } from "change-case";
import { GuildMember, MessageButton, MessageEmbedOptions } from "discord.js";
import emoji from "node-emoji";
import { groupBy } from "lodash";
import { User, MartItem } from "data/db";

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
