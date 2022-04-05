import React from "react";
import Config from "config";
import { NPC, User } from "data/db";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import axios from "axios";
import { Global } from "../Global";
import { PersistentMessageController } from "./PersistentMessageController";
import { channelMention, roleMention, userMention } from "@discordjs/builders";
import Events from "../Events";
import UserController from "./UserController";
import Utils from "../Utils";
import TheProjects, { ProjectsEntryData } from "../TheProjects";
import TheShelters, { SheltersEntryData } from "../TheShelters";

const { r } = Utils;

type EntryData = {
  open: boolean;
  emoji: {
    bb: string;
  };
  projects: ProjectsEntryData;
  shelters: SheltersEntryData;
};

export default class EntranceController {
  static messageEntryData: EntryData | null;
  static rateLimited = false;

  static async init() {
    await this.update();
    await this.bindButtonListeners();
  }

  static async bindButtonListeners() {
    const bb = Global.bot("BIG_BROTHER");

    bb.client.on("interactionCreate", async (i) => {
      if (i.isButton() && i.customId === "ENTER_SERVER") {
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
    const [projects, shelters, bb] = await Promise.all([
      TheProjects.computeEntryData(),
      TheShelters.computeEntryData(),
      NPC.findOneOrFail({ where: { symbol: "BIG_BROTHER" } }),
    ]);

    return {
      open: true,
      emoji: { bb: bb.defaultEmojiId! },
      projects,
      shelters,
    };
  }

  static makeEntryMessage(data: EntryData): MessageOptions {
    const button = new MessageButton()
      .setLabel("ENTER THE SERVER")
      .setStyle(data.open ? "SUCCESS" : "SECONDARY")
      .setDisabled(!data.open)
      .setCustomId("ENTER_SERVER");

    const m = r(
      <>
        Welcome to the **DEGENZ GAME** server, A P2E game that takes place
        entirely in discord!
      </>
    );

    const intro = r(
      <>
        The totalitarian state of **Beautopia** is ruled by{" "}
        {userMention(Config.clientId("BIG_BROTHER"))} {data.emoji.bb}.
        <br />
        A strict class system exists, dictating your value to society.
        <br />
        <br />
        `/hack`,{"\u200e"}`/steal`{"\u200e"}and{"\u200e"}`/toss` your way up the
        Ranks, while taking on the{" "}
        {roleMention(Config.roleId("THOUGHT_POLICE"))} and{" "}
        {userMention(Config.clientId("BIG_BROTHER"))}.
        <br />
        {"\u200e"}
      </>
    );

    const message: MessageOptions = {
      content: m,
      embeds: [
        {
          author: {
            iconURL: "https://s10.gifyu.com/images/VPN-Degenz.gif",
            name: "Enter Beautopia",
          },
          description: intro,
          fields: [
            {
              name: "The Elite",
              value: TheProjects.makeTableRow(
                data.projects.capacity,
                data.projects.districts[0]
              ),
            },
            {
              name: "The Projects",
              value: data.projects.districts
                .slice(1)
                .map((d) => TheProjects.makeTableRow(data.projects.capacity, d))
                .join("\n"),
            },
            {
              name: "The Shelters",
              value: TheShelters.makeTableRows(data.shelters).join("\n"),
            },
          ],
          image: { url: "https://s10.gifyu.com/images/header-smaller.gif" },
          // footer: {
          //   text: "Pressing the button below will have you randomly assigned to a dormitory with capacity.",
          // },
        },
      ],
      components: [new MessageActionRow().addComponents(button)],
    };

    return message;
  }

  static async setEnterMessages(data: EntryData) {
    const message = this.makeEntryMessage(data);
    await PersistentMessageController.set("ENTRANCE", message);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    await i.deferReply({ ephemeral: true });
    const user = await User.findOne({ where: { discordId: i.user.id } });

    if (user && user.inGame) {
      await i.editReply({
        content: `${userMention(user.discordId)} - You're already a Degen.`,
      });
      return;
    }

    const res = await UserController.initShelters(i.user.id, true);

    if (res.success) {
      const user = res.user!;
      const tenancy = user.dormitoryTenancy;
      Events.emit("GAME_ENTERED_DORMITORY", {
        user,
        dormitory: tenancy.dormitory,
      });
      const um = userMention(i.user.id);
      const dorm = channelMention(Config.channelId(tenancy.dormitory.symbol));
      const onboardingThread = channelMention(tenancy.onboardingThreadId!);
      const prefix = tenancy.dormitory.symbol.startsWith("THE") ? "" : "the ";

      await i.editReply({
        embeds: [
          {
            description: r(
              <>
                {um} - You have been assigned a space in {prefix}
                {dorm} dormitory. **GO TO** {onboardingThread} to receive
                further instructions.
              </>
            ),
          },
        ],
      });

      EntranceController.update();
    }
  }

  static async setStatus(open: boolean, isRetry = false) {
    if (this.rateLimited && !isRetry) {
      return { status: 429 };
    }

    const admin = Global.bot("ADMIN");
    const room = await admin.getTextChannel(Config.channelId("ENTRANCE"));

    const disabled = `\u{1f02b}\uff5centrance`;
    const enabled = `\u{1f006}\uff5centrance`;

    const newName = open ? enabled : disabled;

    if (room.name === newName) {
      return { status: 304 };
    }

    const res = await axios({
      method: "PATCH",
      baseURL: "https://discord.com/api/v9",
      url: `/channels/${Config.channelId("ENTRANCE")}`,
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
