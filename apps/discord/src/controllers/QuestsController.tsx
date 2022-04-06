import { channelMention } from "@discordjs/builders";
import {
  ButtonInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import { Global } from "../Global";
import { PersistentMessageController } from "./PersistentMessageController";
import QuestLogController from "./QuestLogController";

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
        const thread = await QuestLogController.show(i.member as GuildMember);
        await i.reply({
          content: `Go to ${channelMention(thread.id)}`,
          ephemeral: true,
        });
      }
    });
  }

  static async setShowQuestsMessage() {
    const button = new MessageButton()
      .setLabel("Open Quest Log")
      .setStyle("SECONDARY")
      .setCustomId("SHOW_QUESTS");

    await PersistentMessageController.set("SHOW_QUESTS", {
      components: [new MessageActionRow().addComponents(button)],
    });
  }

  static async showQuests(i: ButtonInteraction) {
    // Pledge
    // Get Whitelist
    // Learn to Hacker Battle
    // Gamble with Ted
    // Buy Food

    await i.reply({
      embeds: [{ description: "hacker battle" }],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("Details")
            .setStyle("SECONDARY")
            .setCustomId("a")
        ),
      ],
      ephemeral: true,
    });

    await i.followUp({
      embeds: [{ description: "lth" }],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("Details")
            .setStyle("SECONDARY")
            .setCustomId("b")
        ),
      ],
      ephemeral: true,
    });
  }

  static async makeQuestMessage(): Promise<MessageOptions> {
    const claim = new MessageButton()
      .setLabel("\u{1f4b0} PLEDGE TO CLAIM $GBT")
      .setStyle("SUCCESS")
      .setCustomId("claim");

    return {
      embeds: [],
      components: [new MessageActionRow().addComponents(claim)],
    };
  }
}
