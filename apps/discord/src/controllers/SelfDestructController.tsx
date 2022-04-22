import { REST } from "@discordjs/rest";
import React from "react";
import { Message, MessageOptions, TextBasedChannel, Util } from "discord.js";
import delay from "delay";
import { SelfDestructMessage } from "../legacy/onboard-dialog";
import Utils from "../Utils";
import Config from "config";
import { Routes } from "discord-api-types/v10";
import { Global } from "../Global";

export default class SelfDestructController {
  static async init(
    channel: TextBasedChannel,
    seconds: number,
    onDestruct: () => void = () => {}
  ) {
    const admin = Global.bot("ADMIN");
    const adminChannel = await admin.guild.channels.fetch(channel.id);

    if (!adminChannel.isText()) {
      throw new Error("Non text channel.");
    }

    const message = await adminChannel.send(this.makeMessage(seconds));
    this.tick(adminChannel, message, seconds).then(async () => {
      await adminChannel.delete();
      onDestruct();
    });
  }

  static async tick(
    channel: TextBasedChannel,
    message: Message,
    seconds: number
  ) {
    const rest = new REST({ version: "10", rejectOnRateLimit: ["/"] }).setToken(
      Config.botToken("ADMIN")
    );

    for (let i = 0; i < seconds; i++) {
      await delay(1000);
      try {
        rest.patch(Routes.channelMessage(channel.id, message.id), {
          body: this.makeMessage(seconds - i),
        });
      } catch (e) {}
    }
  }

  static makeMessage(seconds: number): MessageOptions {
    return {
      embeds: [
        {
          color: Util.resolveColor("RED"),
          description: Utils.r(<SelfDestructMessage seconds={seconds} />),
        },
      ],
    };
  }
}
