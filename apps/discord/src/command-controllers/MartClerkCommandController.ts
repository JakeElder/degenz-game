import { table } from "table";
import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
} from "discord.js";
import { MartItem } from "data/db";
import Config from "config";
import { CommandController } from "../CommandController";
import { getUser, sellItem } from "../legacy/db";
import Events from "../Events";
import { Format } from "lib";
import { Global } from "../Global";
import { MartItemSymbol } from "data/types";

export default class MartClerkCommandController extends CommandController {
  static async init() {
    const merris = Global.bot("MART_CLERK");

    merris.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) return;
      if (i.customId.startsWith("buy:")) {
        const [_, symbol] = i.customId.split(":") as [any, MartItemSymbol];
        const item = await MartItem.findOne({ where: { symbol } });

        if (!item) {
          i.update({ content: "Error", components: [], embeds: [] });
          return;
        }

        const res = await sellItem(item, i.user.id);

        const user = await getUser(i.user.id);
        Events.emit("MART_ITEM_BOUGHT", { user, item });

        if (res.success) {
          const update = await MartClerkCommandController.makeBuyResponse(
            symbol
          );
          await i.update(update);
          return;
        } else {
          if (res.code === "INSUFFICIENT_BALANCE") {
            i.update({
              content: `You don't have enough ${Format.token()} to buy **${
                item.name
              }**.`,
            });
            return;
          }
          await i.update({
            content: "That's out of stock. Try again later.",
            embeds: [],
            components: [],
          });
        }
      }
    });
  }

  async stock(i: CommandInteraction) {
    return this.buy(i);
  }

  static async makeBuyResponse(
    boughtItem?: MartItemSymbol
  ): Promise<InteractionReplyOptions> {
    const items = await MartItem.find({
      order: { price: -1 },
    });

    const url = `${Config.env("WEB_URL")}/mart-items/buy`;
    const w = 16;

    const emojis: Record<MartItemSymbol, string> = {
      GRILLED_RAT: "\u{1f400} ",
      PIZZA: "\u{1f355} ",
      NOODLES: "\u{1f35c} ",
    };

    const embedItems = boughtItem
      ? items.filter((i) => i.symbol === boughtItem)
      : items;

    const embeds: MessageEmbedOptions[] = embedItems.map((item) => {
      const s = [
        ["Stock", "$GBT", "Effect"],
        [
          item.stock,
          Format.currency(item.price, { bare: true }),
          `+${item.strengthIncrease} \u{1f4aa}`,
        ],
      ];

      const info = !boughtItem
        ? Format.codeBlock(
            table(s, {
              drawVerticalLine: (idx) => [1, 2].includes(idx),
              columnDefault: { alignment: "center" },
              drawHorizontalLine: (i) => i === 1,
              columns: [{ width: 5 }, { width: 4 }, { width: w - 5 - 4 }],
            })
          )
        : Format.codeBlock(
            `+1 ${item.name} added to your inventory.`.padEnd(w, " ")
          );

      return {
        author: {
          name: `${emojis[item.symbol]} ${item.name}`,
        },
        color: item.stock === 0 ? "DARK_RED" : "DARK_GREEN",
        description: info,
        thumbnail: {
          height: 32,
          width: 32,
          url: `${url}/${item.symbol}.png`,
        },
      };
    });

    return {
      embeds,
      components: [
        new MessageActionRow().addComponents(
          items.map((item) =>
            new MessageButton()
              .setCustomId(`buy:${item.symbol}`)
              .setStyle(item.stock > 0 ? "PRIMARY" : "SECONDARY")
              .setLabel(`${emojis[item.symbol]} ${item.name}`)
              .setDisabled(!!boughtItem || item.stock === 0)
          )
        ),
      ],
      ephemeral: true,
    };
  }

  async buy(i: CommandInteraction) {
    const reply = await MartClerkCommandController.makeBuyResponse();
    await i.reply(reply);
  }
}
