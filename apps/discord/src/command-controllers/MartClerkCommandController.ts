import { getBorderCharacters, table } from "table";
import {
  CommandInteraction,
  MessageActionRow,
  MessageSelectMenu,
  SelectMenuInteraction,
} from "discord.js";
import { Format } from "lib";
import { CommandController } from "../CommandController";
import { getMartItems, sellItem } from "../legacy/db";
import { MartItem } from "db";

export default class MartClerkCommandController extends CommandController {
  async stock(i: CommandInteraction) {
    const items = await getMartItems();

    const t = table(
      [
        ["Item", "Price", "Stock"],
        ...items.map((i) => [`${i.name}\n${i.description}`, i.price, i.stock]),
      ],
      {
        border: getBorderCharacters("norc"),
        header: {
          content: `MERRIS MART\nstock`,
          alignment: "center",
        },
        columns: [{}, { alignment: "center" }, { alignment: "center" }],
      }
    );

    await i.reply({
      content: `Here's what I have. \`\`\`${t}\`\`\``,
      ephemeral: true,
    });

    // const martClerk = runner.get("MART_CLERK");
    // const member = await martClerk.getMember(i.user.id);

    // this.emit("WORLD_EVENT", {
    //   event: "MART_STOCK_CHECKED",
    //   data: { member },
    // });
  }

  async buy(i: CommandInteraction) {
    const items = await getMartItems();

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("itemSelect")
        .setPlaceholder("What do you want to buy?")
        .addOptions([
          ...items.map((i) => {
            return {
              label: `${i.description}`,
              description: `[${i.stock}] @ [${Format.currency(i.price)}] ${
                i.description
              }`,
              value: i.symbol,
            };
          }),
        ])
    );

    // Selection handled by MartClerkBot.handleBuy

    await i.reply({
      content: `Yes. Buy what?`,
      components: [row],
      ephemeral: true,
    });
  }

  async handleItemSelect(i: SelectMenuInteraction) {
    const item = await MartItem.findOne({ where: { symbol: i.values[0] } });

    if (!item) {
      i.update({ content: "Error", components: [] });
      return;
    }

    const res = await sellItem(item, i.user.id);

    if (res.success) {
      await i.update({
        content: `Ok. 1 **${item.name}** added to your inventory.`,
        components: [],
      });
      return;
    } else {
      if (res.code === "INSUFFICIENT_BALANCE") {
        i.update({
          content: `You want a **${item.name}**? It's out of stock.\nChoose something else or scram.`,
        });
        return;
      }
      await i.update({ content: "Error", components: [] });
    }
  }
}
