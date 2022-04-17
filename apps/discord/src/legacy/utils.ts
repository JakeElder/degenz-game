import { capitalCase } from "change-case";
import { GuildMember, MessageButton, MessageEmbedOptions } from "discord.js";
import emoji from "node-emoji";
import { User, MartItem, MartItemOwnership } from "data/db";
import { getBorderCharacters, table } from "table";
import truncate from "truncate";
import { Format } from "lib";

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

export async function makeInventoryEmbed(
  user: User,
  member: GuildMember
): Promise<MessageEmbedOptions> {
  const q = await MartItem.createQueryBuilder()
    .select(["mi.name as name", "COUNT(mo.id)"])
    .from(MartItemOwnership, "mo")
    .leftJoin(MartItem, "mi", "mo.item_id = mi.id")
    .where("mo.user_id = :uid", { uid: user.id })
    .groupBy("mo.item_id, mi.name")
    .execute();

  const rows = q.map((q: any) => [truncate(q.name, 25), q.count]);

  const t = table(rows, {
    drawVerticalLine: (idx) => [1].includes(idx),
    columnDefault: { paddingLeft: 0, paddingRight: 0 },
    drawHorizontalLine: () => false,
    columns: [{ width: 27 }, { width: 5, alignment: "center" }],
  });

  return {
    author: {
      name: member.displayName,
      iconURL: member.displayAvatarURL(),
    },
    title: "Inventory",
    fields: [
      { name: "Food", value: Format.codeBlock(t) },
      {
        name: "Items",
        value: Format.codeBlock(
          table([["-- Coming Soon --"]], {
            border: getBorderCharacters("void"),
            columnDefault: { paddingLeft: 0, paddingRight: 0 },
            columns: [{ width: 32, alignment: "center" }],
          })
        ),
      },
    ],
  };
}
