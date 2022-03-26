import React from "react";
import { User } from "data/db";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
  MessageOptions,
  TextBasedChannel,
} from "discord.js";
import { Format } from "lib";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import Interaction from "../Interaction";
import { Global } from "../Global";
import { channelMention, userMention } from "@discordjs/builders";
import Config from "config";

const { r } = Format;

type TabOption = "FIGHT" | "GAMBLE" | "SHOP";

type StepMessageData = {
  user: User;
  active: TabOption | null;
};

export default class NextStepController {
  static async init() {
    await this.bindButtonListener();
  }

  static async bindButtonListener() {
    const ally = Global.bot("ALLY");

    ally.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) {
        return;
      }

      const [type] = i.customId.split(":");

      if (type !== "FIRST_WORLD_CHOICE") {
        return;
      }

      this.activate(i);
    });
  }

  static async activate(i: ButtonInteraction) {
    const { member } = await Interaction.getProps(i);

    const [_, choice, discordId] = i.customId.split(":") as [
      string,
      TabOption,
      string
    ];

    if (member.id !== discordId) {
      await i.reply({
        content: `${userMention(member.id)} - These buttons aren't for you.`,
        ephemeral: true,
      });
      return;
    }

    const rest = new REST({ version: "10", rejectOnRateLimit: ["/"] }).setToken(
      Config.botToken("ALLY")
    );

    const user = await User.findOneOrFail({ where: { discordId } });
    await rest.patch(Routes.channelMessage(i.channelId, i.message.id), {
      body: this.makeMessage({ user, active: choice }),
    });

    // this is more buggy..
    // await message.edit(this.makeMessage({ user, active: choice }));

    await i.update({ fetchReply: false });
  }

  static makeMessage(data: StepMessageData): MessageOptions {
    const { user } = data;

    const content = r(
      <>
        {userMention(user.discordId)} - There's lots to see and do here in **
        {Format.worldName()}**
        <br />
        So what do you want to do?
      </>
    );

    let embed: MessageEmbedOptions;

    if (data.active === "FIGHT") {
      embed = {
        author: {
          name: "Training Dojo",
          icon_url:
            "https://cdn.discordapp.com/app-icons/937151182504362055/3eabbeb86b5c7df2b8d375520f6f121d.png?size=128",
        },
        description: r(
          <>
            If you want to learn to hacker battle, go and see{" "}
            {userMention(Config.clientId("SENSEI"))} in the
            {channelMention(Config.channelId("TRAINING_DOJO"))}. Just press the
            **LFG** button when you get there.
          </>
        ),
      };
    } else if (data.active === "GAMBLE") {
      embed = {
        author: {
          name: "Teds Toss House",
          icon_url:
            "https://cdn.discordapp.com/app-icons/931854952618426398/7ca6b043d27ee1644484744c7bb132dd.png?size=64",
        },
        thumbnail: {},
        description: r(
          <>
            If you want to gamble, go and see{" "}
            {userMention(Config.clientId("TOSSER"))} in{" "}
            {channelMention(Config.channelId("TOSS_HOUSE"))}. Remember to type
            the `/help` command when you get there.
          </>
        ),
      };
    } else if (data.active === "SHOP") {
      embed = {
        author: {
          name: "Merris Mart",
          icon_url:
            "https://cdn.discordapp.com/app-icons/934793761366618152/976dc856aeb598aea36b3c8aabeccd33.png?size=64",
        },
        description: r(
          <>
            If you want to shop, go and see{" "}
            {userMention(Config.clientId("MART_CLERK"))} in{" "}
            {channelMention(Config.channelId("MART"))} channel. Remember to type
            the `/help` command when you get there.
          </>
        ),
      };
    } else {
      embed = { description: content };
    }

    return {
      embeds: [embed],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`FIRST_WORLD_CHOICE:FIGHT:${user.discordId}`)
            .setLabel("Fight")
            .setStyle(
              data.active === null || data.active === "FIGHT"
                ? "PRIMARY"
                : "SECONDARY"
            ),
          new MessageButton()
            .setCustomId(`FIRST_WORLD_CHOICE:GAMBLE:${user.discordId}`)
            .setLabel("Gamble")
            .setStyle(
              data.active === null || data.active === "GAMBLE"
                ? "PRIMARY"
                : "SECONDARY"
            ),
          new MessageButton()
            .setCustomId(`FIRST_WORLD_CHOICE:SHOP:${user.discordId}`)
            .setLabel("Shop")
            .setStyle(
              data.active === null || data.active === "SHOP"
                ? "PRIMARY"
                : "SECONDARY"
            )
        ),
      ],
    };
  }

  static async send(channel: TextBasedChannel, user: User) {
    const data = { user, active: null };
    channel.send(this.makeMessage(data));
  }
}
