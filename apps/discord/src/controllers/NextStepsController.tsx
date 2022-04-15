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

type TabOption = "FIGHT" | "GAMBLE" | "SHOP" | "WHITELIST";

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

    const [_, choice, id] = i.customId.split(":") as [
      string,
      TabOption,
      string
    ];

    if (member.id !== id) {
      await i.reply({
        content: `${userMention(member.id)} - These buttons aren't for you.`,
        ephemeral: true,
      });
      return;
    }

    const rest = new REST({ version: "10", rejectOnRateLimit: ["/"] }).setToken(
      Config.botToken("ALLY")
    );

    const user = await User.findOneOrFail({ where: { id } });
    await rest.patch(Routes.channelMessage(i.channelId, i.message.id), {
      body: this.makeMessage({ user, active: choice }),
    });

    // this is more buggy..
    // await message.edit(this.makeMessage({ user, active: choice }));

    await i.update({ fetchReply: false });
  }

  static makeMessage(data: StepMessageData): MessageOptions {
    const { user } = data;

    const content =
      data.active === null
        ? r(
            <>
              {userMention(user.id)} - There's lots to see and do here in **
              {Format.worldName()}**
              <br />
              So what do you want to do?
            </>
          )
        : `${userMention(user.id)} - what next?`;

    let embeds: MessageEmbedOptions[] = [{ description: content }];

    if (data.active === "FIGHT") {
      embeds.push({
        author: {
          name: "Training Dojo",
          icon_url: `${Config.env("WEB_URL")}/characters/npcs/SENSEI.png`,
        },
        description: r(
          <>
            {userMention(user.id)} - If you want to learn to hacker battle, go
            and see {userMention(Config.clientId("SENSEI"))} in the
            {channelMention(Config.channelId("TRAINING_DOJO"))}. Just press the
            **LFG** button when you get there.
          </>
        ),
      });
    } else if (data.active === "GAMBLE") {
      embeds.push({
        author: {
          name: "Teds Toss House",
          icon_url: `${Config.env("WEB_URL")}/characters/npcs/TOSSER.png`,
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
      });
    } else if (data.active === "SHOP") {
      embeds.push({
        author: {
          name: "Merris Mart",
          icon_url: `${Config.env("WEB_URL")}/characters/npcs/MART_CLERK.png`,
        },
        description: r(
          <>
            If you want to shop, go and see{" "}
            {userMention(Config.clientId("MART_CLERK"))} in{" "}
            {channelMention(Config.channelId("MART"))} channel. Remember to type
            the `/help` command when you get there.
          </>
        ),
      });
    } else if (data.active === "WHITELIST") {
      embeds.push({
        author: {
          name: "Whitelist",
          icon_url: `${Config.env(
            "WEB_URL"
          )}/characters/npcs/RESISTANCE_LEADER.png`,
        },
        description: r(
          <>
            If you want Whitelist, go to the{" "}
            {channelMention(Config.channelId("WHITELIST"))} channel.
            <br />
            And press the **"Give Me Whitelist"** button.
          </>
        ),
      });
    }

    return {
      embeds,
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`FIRST_WORLD_CHOICE:FIGHT:${user.id}`)
            .setLabel("Fight")
            .setStyle(
              data.active === null || data.active === "FIGHT"
                ? "PRIMARY"
                : "SECONDARY"
            ),
          new MessageButton()
            .setCustomId(`FIRST_WORLD_CHOICE:GAMBLE:${user.id}`)
            .setLabel("Gamble")
            .setStyle(
              data.active === null || data.active === "GAMBLE"
                ? "PRIMARY"
                : "SECONDARY"
            ),
          new MessageButton()
            .setCustomId(`FIRST_WORLD_CHOICE:SHOP:${user.id}`)
            .setLabel("Shop")
            .setStyle(
              data.active === null || data.active === "SHOP"
                ? "PRIMARY"
                : "SECONDARY"
            ),
          new MessageButton()
            .setCustomId(`FIRST_WORLD_CHOICE:WHITELIST:${user.id}`)
            .setLabel("Get Whitelist")
            .setStyle(
              data.active === null || data.active === "WHITELIST"
                ? "DANGER"
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
