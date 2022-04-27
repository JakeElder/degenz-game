import React from "react";
import { userMention } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { Global } from "../Global";
import Utils from "../Utils";

const { r } = Utils;

export default class WelcomeRoomController {
  static async welcome(member: GuildMember) {
    await Global.bot("BIG_BROTHER").ready;

    const channel = await Utils.ManagedChannel.getOrFail("WELCOME_ROOM");
    await channel.send(r(<>**WELCOME, COMRADE** {userMention(member.id)}. </>));
  }
}
