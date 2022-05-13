import { MessageOptions } from "discord.js";
import { userMention } from "@discordjs/builders";
import { Command } from "../../lib";
import Config from "config";
import { channelMention } from "@discordjs/builders";
import dedent from "ts-dedent";
import axios from "axios";
import { Format } from "lib";

export default class SendUpdate extends Command {
  static description = "Send an update";

  static args = [
    {
      name: "message",
      required: true,
      options: ["reaction-rewards"],
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(SendUpdate);

    const channel = await this.getChannel("UPDATES", "BIG_BROTHER");

    if (args.message === "reaction-rewards") {
      const message = await this.reactionRewards();
      await channel.send(message);
    }
  }

  async reactionRewards(): Promise<MessageOptions> {
    const response = await axios.get(
      "https://s8.gifyu.com/images/imagecf18a7bdd9d8c75d.png",
      { responseType: "arraybuffer" }
    );
    const buffer = Buffer.from(response.data, "utf-8");

    return {
      content: dedent`
      🚨 **LISTEN UP, DEGEN SCUM** 🚨

      You can now **EARN** ${Config.emojiCode(
        "GBT_COIN"
      )} **GoodBoyTokens©** by **REACTING TO MESSAGES** in the following channels;

      ${channelMention(Config.channelId("ANNOUNCEMENTS"))}
      ${channelMention(Config.channelId("UPDATES"))}
      ${channelMention(Config.channelId("SNEAK_PEEKS"))}
      ${channelMention(Config.channelId("GIVEAWAYS"))}
      ${channelMention(Config.channelId("TWEETS"))}
      ${channelMention(Config.channelId("RAIDS"))}

      **EARN ${Format.currency(
        10
      )} PER REACTION** then go spend it on ${Config.emojiCode(
        "NUU_PING"
      )} **Nuu Ping** © or in the ${channelMention(
        Config.channelId("JPEG_STORE")
      )} or something you *animals*..
      
      **🚀 Try it by reacting to *this* message**.. *Limit of 100 $GBT reward per message*

      And, @everyone - the **first person** to knock ${userMention(
        "396658712447549460"
      )} of the **#1** spot will get a **FREE MINT PASS 🎉**.

      **---------**

      `,
      files: [buffer],
    };
  }
}
