import { getBorderCharacters, table } from "table";
import {
  CommandInteraction,
  MessageEmbedOptions,
  SelectMenuInteraction,
} from "discord.js";
import { MartItem } from "data/db";
import Config from "config";
import { CommandController } from "../CommandController";
import { getMartItems, getUser, sellItem } from "../legacy/db";
import Events from "../Events";
import { Global } from "../Global";
import { Format } from "lib";
import truncate from "truncate";

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

    const user = await getUser(i.user.id);
    Events.emit("MART_STOCK_CHECKED", { user });
  }

  async buy(i: CommandInteraction) {
    const items = await getMartItems();

    // const row = new MessageActionRow().addComponents(
    //   new MessageSelectMenu()
    //     .setCustomId("itemSelect")
    //     .setPlaceholder("What do you want to buy?")
    //     .addOptions([
    //       ...items.map((i) => {
    //         return {
    //           label: `${i.description}`,
    //           description: `[${i.stock}] @ [${Format.currency(i.price)}] ${
    //             i.description
    //           }`,
    //           value: i.symbol,
    //         };
    //       }),
    //     ])
    // );

    const url = `${Config.env("WEB_URL")}/mart-items/buy`;
    // const merris = Global.bot("MART_CLERK");
    const w = 24;

    const embeds: MessageEmbedOptions[] = items.map((item) => {
      // `${position.toString().padStart(2, " ")}.${truncate(
      //   l.displayName,
      //   22 - 4 - 1
      // )}`,
      // ` ${Format.token()} ${Format.currency(l.gbt, { bare: true })}`,

      // prettier-ignore
      const s = [
        ['Stock', 'Price', 'Effect'],
        [item.stock, Format.currency(item.price, { bare: true }), `+${item.strengthIncrease} strength`]
      ];

      const info = Format.codeBlock(
        table(s, {
          drawVerticalLine: (idx) => [1, 2].includes(idx),
          columnDefault: { alignment: "center" },
          drawHorizontalLine: (i) => i === 1,
          columns: [{ width: 5 }, { width: 5 }, { width: w - 5 - 5 }],
        })
      );

      // const description = Format.codeBlock(
      //   table([[item.description]], {
      //     border: getBorderCharacters("void"),
      //     columns: [{ width: w, wrapWord: true }],
      //   })
      // );

      return {
        author: {
          name: item.name,
          // iconURL: merris.client.user!.displayAvatarURL({ size: 32 }),
        },
        description: info,
        thumbnail: {
          height: 32,
          width: 32,
          url: `${url}/${item.symbol}.png`,
        },
      };
    });

    // Selection handled by MartClerkBot.handleBuy

    await i.reply({
      embeds,
      // components: [row],
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

    const user = await getUser(i.user.id);
    Events.emit("MART_ITEM_BOUGHT", { user, item });

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
