import React from "react";
import Config from "config";
import { AppState, Dormitory, User } from "data/db";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import { Format } from "lib";
import { DormitorySymbol } from "data/types";
import axios from "axios";
import { Global } from "../Global";
import { PersistentMessageController } from "./PersistentMessageController";
import { channelMention, userMention } from "@discordjs/builders";
import Events from "../Events";
import UserController from "./UserController";
import Utils from "../Utils";

const { r } = Utils;

type EntryData = {
  open: boolean;
  dormitoryCapacity: number;
  dormitories: {
    symbol: DormitorySymbol;
    capacity: number;
    tenancies: number;
    available: boolean;
    tableEmoji: string;
  }[];
};

export default class EnterTheProjectsController {
  static messageEntryData: EntryData | null;
  static rateLimited = false;

  static async init() {
    await this.update();
    await this.bindButtonListeners();
  }

  static async bindButtonListeners() {
    const bb = Global.bot("BIG_BROTHER");
    await bb.ready;

    bb.client.on("interactionCreate", async (i) => {
      if (i.isButton() && i.customId === "ENTER_GAME_DORMITORY") {
        this.handleButtonPress(i);
      }
    });
  }

  static async update() {
    const data = await this.computeEntryData();
    await this.setEnterMessages(data);
    this.setStatus(data.open);
  }

  static async computeEntryData(): Promise<EntryData> {
    const [state, dormitories] = await Promise.all([
      AppState.fetch(),
      Dormitory.find({
        relations: ["tenancies"],
        order: { symbol: 1 },
      }),
    ]);

    const computedDormitories: EntryData["dormitories"] = dormitories.map(
      (d) => {
        const available = state.dormitoryCapacity > d.tenancies.length;
        return {
          symbol: d.symbol,
          capacity: state.dormitoryCapacity - d.tenancies.length,
          tenancies: d.tenancies.length,
          available,
          tableEmoji: available ? d.activeEmoji : d.inactiveEmoji,
        };
      }
    );

    return {
      dormitoryCapacity: state.dormitoryCapacity,
      open: computedDormitories.some((d) => d.available),
      dormitories: computedDormitories,
    };
  }

  static makeEntryMessage(data: EntryData) {
    const button = new MessageButton()
      .setLabel("JOIN THE SHELTERS")
      .setStyle(data.open ? "SUCCESS" : "SECONDARY")
      .setDisabled(!data.open)
      .setCustomId("ENTER_GAME_DORMITORY");

    const l = data.dormitories
      .slice()
      .sort((a, b) => b.symbol.length - a.symbol.length)[0].symbol.length;

    const dormitoryTable = data.dormitories
      .map((d) => {
        return `${d.tableEmoji} \`${d.symbol.padEnd(l)}\` => ${
          d.available
            ? `\`[VACANCIES]\` => \`${d.capacity}/${data.dormitoryCapacity} available\``
            : `\`  [FULL]   \` => \`${d.capacity}/${data.dormitoryCapacity} available\``
        }`;
      })
      .join("\n");

    const message: MessageOptions = {
      content: `If no apartments are available, you may join one of our **LUXURY DORMITORIES**.\n**Press the button below to join the shelters.**`,
      embeds: [
        {
          author: {
            iconURL: "https://s10.gifyu.com/images/VPN-Degenz.gif",
            name: "Join The Shelters",
          },
          description: `Securing a space in a dormitory will grant you entry to the game. New dormitories and bunks are being added all the time, so check back often to secure your space in ${Format.worldName()}.\n\n${dormitoryTable}`,
          footer: {
            text: "Pressing the button below will have you randomly assigned to a dormitory that has capacity.",
          },
        },
      ],
      components: [new MessageActionRow().addComponents(button)],
    };

    return message;
  }

  static async setEnterMessages(data: EntryData) {
    const entryOptions = this.makeEntryMessage(data);
    await PersistentMessageController.set("THE_SHELTERS_ENTRY", entryOptions);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    await i.deferReply({ ephemeral: true });
    const user = await User.findOneOrFail({ where: { discordId: i.user.id } });
    if (user.inGame) {
      await i.editReply({
        content: `${userMention(user.discordId)} - You're already a Degen.`,
      });
      return;
    }

    const res = await UserController.initShelters(i.user.id, true);

    if (res.success) {
      const user = res.user!;
      Events.emit("GAME_ENTERED_DORMITORY", {
        user,
        dormitory: user.dormitoryTenancy.dormitory,
      });
      const um = userMention(i.user.id);
      const dorm = channelMention(
        Config.channelId(user.dormitoryTenancy.dormitory.symbol)
      );
      const bunk = channelMention(user.dormitoryTenancy.bunkThreadId);

      await i.editReply(
        r(
          <>
            {um} - You have been assigned your own bunk in {dorm} dormitory. Go
            to {bunk}, your own private area to receive further instructions.
          </>
        )
      );

      EnterTheProjectsController.update();
    }
  }

  static async setStatus(open: boolean, isRetry = false) {
    if (this.rateLimited && !isRetry) {
      return { status: 429 };
    }

    const admin = Global.bot("ADMIN");
    const room = await admin.getTextChannel(
      Config.channelId("ENTER_THE_SHELTERS")
    );

    const disabled = `\u{1f510}\uff5cthe-shelters`;
    const enabled = `\u{1f513}\uff5cthe-shelters`;

    const newName = open ? enabled : disabled;

    if (room.name === newName) {
      return { status: 304 };
    }

    const res = await axios({
      method: "PATCH",
      baseURL: "https://discord.com/api/v9",
      url: `/channels/${Config.channelId("ENTER_THE_SHELTERS")}`,
      data: { name: newName },
      headers: {
        Accept: "application/json",
        Authorization: `Bot ${Config.botToken("ADMIN")}`,
      },
      validateStatus: () => true,
    });

    if (res.status === 429) {
      const wait = res.data.retry_after + 2;
      console.log(`RATE_LIMIT: retrying after ${wait} seconds`);
      this.rateLimited = true;
      setTimeout(async () => {
        const data = await this.computeEntryData();
        const res = await this.setStatus(data.open);
        console.log("retry:", res);
        if (res.status >= 200 && res.status < 300) {
          console.log(`RATE_LIMIT_LIFTED: waiting room status in sync`);
        }
      }, wait * 1000);
    } else if (res.status < 200 || res.status >= 300) {
      console.log(res.status, res.statusText);
    } else {
      this.rateLimited = false;
    }

    return res;
  }
}
