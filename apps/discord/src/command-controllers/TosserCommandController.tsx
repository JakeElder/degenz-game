import React from "react";
import { CommandInteraction } from "discord.js";
import { Channel } from "../Channel";
import { CommandController } from "../CommandController";
import TossController from "../controllers/TossController";
import { Global } from "../Global";
import Utils from "../Utils";
import { ChannelMention, UserMention } from "../legacy/templates";
import Config from "config";

export default class TosserCommandController extends CommandController {
  async toss(i: CommandInteraction) {
    const channel = await Channel.getDescriptor(i.channelId);

    if (!channel.isTossHouse) {
      i.reply({
        content: Utils.r(
          <>
            <UserMention id={i.user.id} />, come to{" "}
            <ChannelMention id={Config.channelId("TOSS_HOUSE")} /> if you wanna
            toss.
          </>
        ),
        ephemeral: true,
      });
      return false;
    }

    await TossController.toss(i, Global.bot("ADMIN"));
  }
}
