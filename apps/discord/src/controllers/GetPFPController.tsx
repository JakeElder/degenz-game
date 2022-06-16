import React from "react";
import Config from "config";
import { PFP } from "data/db";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import { Global } from "../Global";
import Utils from "../Utils";
import { PersistentMessageController } from "./PersistentMessageController";
import { ChannelMention, RoleMention } from "../legacy/templates";
import { Format } from "lib";
import { shuffle } from "lodash";

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
          title: "Rep a Degenz PFP and receive",
          color: "PURPLE",
          description: Utils.r(
            <>
              {Config.emojiCode("DEGEN")}{" "}
              <RoleMention id={Config.roleId("DEGEN_SQUAD")} /> role
              <br />
              {Config.emojiCode("GBT_COIN")} {Format.currency(2000)}
              <br />
              🌟 **Priority access** to special{" "}
              <ChannelMention id={Config.channelId("JPEG_STORE")} /> raffles.
              <br />
              <br />
              __**How to REP the DEGENZ**__
              <br />
              <br />
              {Utils.numberEmoji(0)} Press the **GIVE PFP** button
              <br />
              {Utils.numberEmoji(1)} Update your Discord and Twitter PFP's
              <br />
              {Utils.numberEmoji(2)} Join our{" "}
              <ChannelMention id={Config.channelId("RAIDS")} />
              <br />
              {Utils.numberEmoji(3)} Post a screenshot in{" "}
              <ChannelMention id={Config.channelId("QUEST_COMPLETION_PROOF")} />
              <br />
            </>
          ),
          image: {
            url: "https://3958265705-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FMjoI9FGGukmdzdzLDLEw%2Fuploads%2FIHcLTRYM1VGPLy9v94Nj%2FScreenshot%202022-05-25%20at%2010.44.20%20PM.png?alt=media&token=5cd231e6-472b-4f20-80f6-f917968daae7",
          },
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("GET_PFP")
            .setEmoji(Config.emojiCode("DEGEN_W"))
            .setStyle("DANGER")
            .setLabel("GET RANDOM PFP")
        ),
      ],
    };

    await PersistentMessageController.set("GET_PFP", message);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    const pfps = shuffle(this.pfps);
    const url = (id: string) => `${Config.env("WEB_URL")}/pfps/${id}.png`;
    const pfp = url(pfps[0].id);
    await i.reply({
      embeds: [{ color: "GOLD", image: { url: pfp } }],
      ephemeral: true,
    });
  }
}
