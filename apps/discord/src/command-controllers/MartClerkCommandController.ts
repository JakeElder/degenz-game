import { table } from "table";
import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
} from "discord.js";
import { MartItem, Emoji } from "data/db";
import Config from "config";
import { CommandController } from "../CommandController";
import { getUser, sellItem } from "../legacy/db";
import Events from "../Events";
import { Format } from "lib";
import { Global } from "../Global";
import { MartItemSymbol } from "data/types";
import AchievementController from "../controllers/AchievementController";

export default class MartClerkCommandController extends CommandController {
  static async init() {
    const merris = Global.bot("MART_CLERK");

    merris.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) return;
      if (i.customId.startsWith("buy:")) {
        const [_, id] = i.customId.split(":") as [any, MartItemSymbol];
        const item = await MartItem.findOne({ where: { id } });

        if (!item) {
          i.update({ content: "Error", components: [], embeds: [] });
          return;
        }

        const res = await sellItem(item, i.user.id);

        const user = await getUser(i.user.id);

        if (res.success) {
          const update = await MartClerkCommandController.makeBuyResponse(id);
          await i.update(update);
          Events.emit("MART_ITEM_BOUGHT", { user, item });
          AchievementController.checkAndAward(
            user,
            "SHOP_AT_MERRIS_MART_QUEST_COMPLETED"
          );
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
    const w = 20;

    const embedItems = boughtItem
      ? items.filter((i) => i.id === boughtItem)
      : items;

    const embeds: MessageEmbedOptions[] = embedItems.map((item) => {
      const s = [
        ["Stock", "Price"],
        [
          item.stock,
          `${Format.currency(item.price, { bare: true })} ${Format.token()}`,
        ],
      ];

      const info = !boughtItem
        ? Format.codeBlock(
            table(s, {
              drawVerticalLine: (idx) => [1].includes(idx),
              columnDefault: {
                alignment: "center",
                paddingLeft: 0,
                paddingRight: 0,
              },
              drawHorizontalLine: (i) => i === 1,
              columns: [{ width: 16 }, { width: 16 }],
            })
          )
        : Format.codeBlock(
            `+1 ${item.name} added to your inventory.`.padEnd(w, " ")
          );

      return {
        title: `${item.emoji} ${item.name}`,
        color: item.stock === 0 ? "DARK_RED" : "DARK_GREEN",
        description: info,
        thumbnail: {
          height: 32,
          width: 32,
          url: `${url}/${item.id}.png?v1`,
        },
        image: { url: `${Config.env("WEB_URL")}/blank-row.png` },
      };
    });

    return {
      embeds,
      components: [
        new MessageActionRow().addComponents(
          items.map((item) =>
            new MessageButton()
              .setCustomId(`buy:${item.id}`)
              .setEmoji(item.emoji.identifier)
              .setStyle(
                !!boughtItem || item.stock === 0 ? "SECONDARY" : "PRIMARY"
              )
              .setLabel(item.name)
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
