import Config from "config";
import { PFP, User } from "data/db";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageOptions,
  Util,
} from "discord.js";
import { Global } from "../Global";
import Utils from "../Utils";
import { PersistentMessageController } from "./PersistentMessageController";
import { Format } from "lib";
import { shuffle } from "lodash";
import Events from "../Events";
import { channelMention, roleMention } from "@discordjs/builders";

export default class GetPFPController {
  static pfps: PFP[];

  static async init() {
    await this.bindButtonListeners();
    this.pfps = await PFP.find();
    await this.update();
  }

  static async update() {
    await this.setMessage();
  }

  static async bindButtonListeners() {
    const ally = Global.bot("ALLY");

    ally.client.on("interactionCreate", async (i) => {
      if (i.isButton() && i.customId === "GET_PFP") {
        this.handleButtonPress(i);
      }
    });
  }

  static async setMessage() {
    const description = `
        __**Rep the Degenz and receive**__

        ${Config.emojiCode("DEGEN")} ${roleMention(
      Config.roleId("DEGEN_SQUAD")
    )} role
        ${Config.emojiCode("GBT_COIN")} ${Format.currency(1500)}
        🌟 **Priority access** to special ${channelMention(
          Config.channelId("JPEG_STORE")
        )} raffles

        __**How to REP the DEGENZ**__

        ${Utils.numberEmoji(0)} Press the **Get Random PFP** button
        ${Utils.numberEmoji(1)} Use as your *Discord* **and** *Twitter* PFP
        ${Utils.numberEmoji(2)} Post proof in ${channelMention(
      Config.channelId("QUEST_COMPLETION_PROOF")
    )}

        __**💎 BONUS**__

        👯 Double $GBT for ${channelMention(Config.channelId("RAIDS"))}
        ${Config.emojiCode("GBT_COIN")} Extra 100 $GBT in ${channelMention(
      Config.channelId("HALL_OF_ALLEIGANCE")
    )}
`;

    const message: MessageOptions = {
      embeds: [
        {
          author: {
            icon_url: `https://stage.degenz.game/degenz-game-character-preview.gif`,
            name: "Get PFP",
          },
          color: Util.resolveColor("PURPLE"),
          description,
          image: {
            url: "https://stage.degenz.game/degenz-game-character-preview.gif",
          },
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("GET_PFP")
            .setEmoji(Config.emojiCode("DEGEN_W"))
            .setStyle("DANGER")
            .setLabel("Get Random PFP")
        ),
      ],
    };

    await PersistentMessageController.set("GET_PFP", message);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    const pfps = shuffle(this.pfps);
    const url = (id: string) => `${Config.env("WEB_URL")}/pfps/${id}.png`;
    const pfp = url(pfps[0].id);

    const [user] = await Promise.all([
      await User.findOneByOrFail({ id: i.user.id }),
      i.reply({
        embeds: [{ color: "GOLD", image: { url: pfp } }],
        ephemeral: true,
      }),
    ]);

    Events.emit("GET_PFP_BUTTON_CLICKED", { user });
  }
}
