import React from "react";
import Config from "config";
import { PFP, User } from "data/db";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageOptions,
  Util,
} from "discord.js";
import { Global } from "../Global";
import Utils from "../Utils";
import { PersistentMessageController } from "./PersistentMessageController";
import { ChannelMention, RoleMention } from "../legacy/templates";
import { Format } from "lib";
import { shuffle } from "lodash";
import Events from "../Events";

export default class GetPFPController {
  static pfps: PFP[];

  static async init() {
    await this.bindButtonListeners();
    this.pfps = await PFP.find();
    await this.update();
  }

  static async update() {
    await this.setMessage();
  }

  static async bindButtonListeners() {
    const ally = Global.bot("ALLY");

    ally.client.on("interactionCreate", async (i) => {
      if (i.isButton() && i.customId === "GET_PFP") {
        this.handleButtonPress(i);
      }
    });
  }

  static async setMessage() {
    const message: MessageOptions = {
      embeds: [
        {
          author: {
            icon_url: `https://stage.degenz.game/degenz-game-character-preview.gif`,
            name: "Get PFP",
          },
          color: Util.resolveColor("PURPLE"),
          description: Utils.r(
            <>
              __**Rep the Degenz and receive**__
              <br />
              <br />
              {Config.emojiCode("DEGEN")}
              <RoleMention id={Config.roleId("DEGEN_SQUAD")} /> role
              <br />
              {Config.emojiCode("GBT_COIN")} {Format.currency(1500)}
              <br />
              🌟 **Priority access** to special{" "}
              <ChannelMention id={Config.channelId("JPEG_STORE")} /> raffles.
              <br />
              <br />
              __**How to REP the DEGENZ**__
              <br />
              <br />
              {Utils.numberEmoji(0)} Press the **Get Random PFP** button
              <br />
              {Utils.numberEmoji(1)} Use as your *Discord* **and** *Twitter* PFP
              <br />
              {Utils.numberEmoji(2)} Post proof in{" "}
              <ChannelMention id={Config.channelId("QUEST_COMPLETION_PROOF")} />
              <br />
              <br />
              __**💎 BONUS**__
              <br />
              <br />
              👯 Double $GBT for{" "}
              <ChannelMention id={Config.channelId("RAIDS")} />
              <br />
              {Config.emojiCode("GBT_COIN")} Extra 100 $GBT in{" "}
              <ChannelMention id={Config.channelId("HALL_OF_ALLEIGANCE")} />
            </>
          ),
          image: {
            url: "https://stage.degenz.game/degenz-game-character-preview.gif",
          },
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("GET_PFP")
            .setEmoji(Config.emojiCode("DEGEN_W"))
            .setStyle("DANGER")
            .setLabel("Get Random PFP")
        ),
      ],
    };

    await PersistentMessageController.set("GET_PFP", message);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    const pfps = shuffle(this.pfps);
    const url = (id: string) => `${Config.env("WEB_URL")}/pfps/${id}.png`;
    const pfp = url(pfps[0].id);

    const [user] = await Promise.all([
      await User.findOneByOrFail({ id: i.user.id }),
      i.reply({
        embeds: [{ color: "GOLD", image: { url: pfp } }],
        ephemeral: true,
      }),
    ]);

    Events.emit("GET_PFP_BUTTON_CLICKED", { user });
  }
}
