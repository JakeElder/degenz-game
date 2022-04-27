import React from "react";
import Config from "config";
import { Emoji, NPC, User } from "data/db";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import { Global } from "../Global";
import { PersistentMessageController } from "./PersistentMessageController";
import { channelMention, roleMention, userMention } from "@discordjs/builders";
import Events from "../Events";
import UserController from "./UserController";
import Utils from "../Utils";
import TheProjects, { ProjectsEntryData } from "../TheProjects";
import TheShelters, { SheltersEntryData } from "../TheShelters";
import { UserMention } from "../legacy/templates";

const { r } = Utils;

type EntryData = {
  open: boolean;
  emoji: {
    bb: Emoji;
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
    // this.setStatus(data.open);
  }

  static async computeEntryData(): Promise<EntryData> {
    const [projects, shelters, bb] = await Promise.all([
      TheProjects.computeEntryData(),
      TheShelters.computeEntryData(),
      NPC.findOneOrFail({ where: { id: "BIG_BROTHER" } }),
    ]);

    return {
      open: true,
      emoji: { bb: bb.emoji },
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
        {userMention(Config.clientId("BIG_BROTHER"))} {data.emoji.bb.toString()}
        .
        <br />
        A strict class system exists, dictating your value to society.
        <br />
        <br />
        `/hack`,{"\u200e"}`/steal`{"\u200e"}and{"\u200e"}`/toss` your way up the
        ranks, while taking on the{" "}
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
    const user = await User.findOne({ where: { id: i.user.id } });

    if (user && user.inGame) {
      await i.editReply({
        embeds: [
          {
            color: "RED",
            description: Utils.r(
              <>
                <UserMention id={user.id} /> - What, **again**? You're already
                *in* the server.
              </>
            ),
          },
        ],
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

      const cm = channelMention(user.onboardingChannel.discordChannel.id);

      const member = await UserController.getMember(user.id);

      await i.editReply({
        embeds: [
          {
            author: {
              iconURL: member.displayAvatarURL(),
              name: member.displayName,
            },
            title: "Welcome to BEAUTOPIA",
            color: "RED",
            description: r(
              <>**GO TO** {cm} to receive further instructions.</>
            ),
          },
        ],
      });

      EntranceController.update();
    }
  }
}
