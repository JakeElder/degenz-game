import React from "react";
import Config from "app-config";
import { NPC } from "db";
import { TextChannel } from "discord.js";
import { BotId } from "types";
import { Events } from "./Events";
import { Global } from "./Global";
import Utils from "./Utils";
import { Format } from "lib";

const { r } = Utils;

type Event<T extends keyof Events> = Parameters<Events[T]>[0];

export default class HOPNotifier {
  static ready: Promise<void>;
  static hop: TextChannel;

  static async init() {
    this.ready = new Promise(async (resolve) => {
      const bb = Global.bot("BIG_BROTHER");
      this.hop = await bb.getTextChannel(Config.channelId("HALL_OF_PRIVACY"));
      resolve();
    });
  }

  static async log(botSymbol: BotId, e: keyof Events, message: string) {
    const npc = await NPC.findOneOrFail({
      where: { symbol: botSymbol },
    });
    await this.ready;
    this.hop.send(`>>> ${npc.defaultEmojiId} \`${e}\` ${message}`);
  }

  static async balanceChecked(e: Event<"BALANCE_CHECKED">) {
    const message = r(
      <>
        **{e.data.user.displayName}** checked their balance.{" "}
        {Format.currency(e.data.user.gbt)}.
      </>
    );
    this.log("BANKER", e.type, message);
  }
}
