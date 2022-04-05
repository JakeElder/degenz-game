import React from "react";
import { userMention } from "@discordjs/builders";
import Config from "config";
import { GuildMember } from "discord.js";
import { Global } from "../Global";
import Utils from "../Utils";

const { r } = Utils;

export default class WelcomeRoomController {
  static async welcome(member: GuildMember) {
    const bb = Global.bot("BIG_BROTHER");
    await bb.ready;

    const welcomeChannel = await bb.getTextChannel(
      Config.channelId("WELCOME_ROOM")
    );

    await welcomeChannel.send(
      r(<>**WELCOME, COMRADE** {userMention(member.id)}. </>)
    );
  }
}
