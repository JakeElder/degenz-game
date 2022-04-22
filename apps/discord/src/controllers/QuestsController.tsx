import React from "react";
import { MessageActionRow, MessageButton } from "discord.js";
import { Global } from "../Global";
import { PersistentMessageController } from "./PersistentMessageController";
import QuestLogController from "./QuestLogController";
import Utils from "../Utils";
import { channelMention, userMention } from "@discordjs/builders";

export default class QuestsController {
  static async init() {
    await this.bindButtonListeners();
    await this.setShowQuestsMessage();
  }

  static async bindButtonListeners() {
    const admin = Global.bot("ADMIN");

    admin.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) {
        return;
      }

      if (i.customId === "SHOW_QUESTS") {
        await i.deferReply({ ephemeral: true });
        const thread = await QuestLogController.show(i.user.id);
        await i.editReply({
          embeds: [
            {
              color: "RED",
              description: Utils.r(
                <>
                  {userMention(i.user.id)} - **Go to**{" "}
                  {channelMention(thread.id)} to see your quest progress.
                </>
              ),
            },
          ],
        });
      }
    });
  }

  static async setShowQuestsMessage() {
    const button = new MessageButton()
      .setLabel("Open Quest Log")
      .setCustomId("SHOW_QUESTS")
      .setStyle("DANGER");

    await PersistentMessageController.set("SHOW_QUESTS", {
      embeds: [
        {
          image: {
            url: "https://cdn.discordapp.com/attachments/922414052708327497/965595416538271784/PCScreen2.gif",
          },
        },
      ],
      components: [new MessageActionRow().addComponents(button)],
    });
  }
}
