import React from "react";
import { table } from "table";
import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
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
import AchievementController from "../controllers/AchievementController";
import { Channel } from "../Channel";
import Utils from "../Utils";
import { ChannelMention, UserMention } from "../legacy/templates";

type RestrictFn = (
  handler: (i: CommandInteraction) => void
) => (i: CommandInteraction) => void;

const restrictToMart: RestrictFn = (handler) => async (i) => {
  const channel = await Channel.getDescriptor(i.channelId);

  if (channel.isMart) {
    return handler(i);
  }

  i.reply({
    content: Utils.r(
      <>
        <UserMention id={i.user.id} />, come to{" "}
        <ChannelMention id={Config.channelId("MART")} /> if you want to buy
        stuff.
      </>
    ),
    ephemeral: true,
  });
};

export default class MartClerkCommandController extends CommandController {
  static async init() {
    const merris = Global.bot("MART_CLERK");

    merris.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) return;

      if (i.customId.startsWith("buy:")) {
        const [_, id] = i.customId.split(":") as [any, MartItemSymbol];
        const item = await MartItem.findOne({ where: { id } });

        await i.update(
          (await MartClerkCommandController.makeBuyResponse(
            id,
            true
          )) as InteractionUpdateOptions
        );

        if (!item) {
          i.update({ content: "Error", components: [], embeds: [] });
          return;
        }

        const res = await sellItem(item, i.user.id);

        const user = await getUser(i.user.id);

        if (res.success) {
          const update = await MartClerkCommandController.makeBuyResponse(id);
          await i.editReply(update);
          Events.emit("MART_ITEM_BOUGHT", { user, item });
          AchievementController.checkAndAward(
            user,
            "SHOP_AT_MERRIS_MART_QUEST_COMPLETED"
          );
          return;
        } else {
          if (res.code === "INSUFFICIENT_BALANCE") {
            i.editReply({
              content: `You don't have enough ${Format.token()} to buy **${
                item.name
              }**.`,
            });
            return;
          }
          await i.editReply({
            content: "That's out of stock. Try again later.",
            embeds: [],
            components: [],
          });
        }
      }
    });
  }

  stock = restrictToMart((i) => {
    return this.buy(i);
  });

  static async makeBuyResponse(
    boughtItem?: MartItemSymbol,
    processing = false
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
              .setEmoji(
                boughtItem === item.id && processing
                  ? Config.emojiCode("LOADING")
                  : item.emoji.identifier
              )
              .setStyle(
                processing || !!boughtItem || item.stock === 0
                  ? "SECONDARY"
                  : "PRIMARY"
              )
              .setLabel(item.name)
              .setDisabled(processing || !!boughtItem || item.stock === 0)
          )
        ),
      ],
      ephemeral: true,
    };
  }

  buy = restrictToMart(async (i) => {
    const deferPromise = i.deferReply({ ephemeral: true });
    const reply = await MartClerkCommandController.makeBuyResponse();
    await deferPromise;
    await i.editReply(reply);
  });
}
