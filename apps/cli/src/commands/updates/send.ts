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
      options: [
        "reaction-rewards",
        "shelters-closed",
        "premint-mart",
        "mart-closed",
        "teds-closed",
        "bank-closed",
        "arena-closed",
      ],
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(SendUpdate);

    if (args.message === "reaction-rewards") {
      const channel = await this.getChannel("UPDATES", "BIG_BROTHER");
      const message = await this.reactionRewards();
      await channel.send(message);
    }

    if (args.message === "shelters-closed") {
      const channel = await this.getChannel("VULTURE", "ALLY");
      const message = await this.sheltersClosed();
      await channel.send(message);
    }

    if (args.message === "teds-closed") {
      const channel = await this.getChannel("TOSS_HOUSE", "TOSSER");
      const message = await this.tedsClosed();
      await channel.send(message);
    }

    if (args.message === "mart-closed") {
      const channel = await this.getChannel("MART", "MART_CLERK");
      const message = await this.martClosed();
      await channel.send(message);
    }

    if (args.message === "bank-closed") {
      const channel = await this.getChannel("BANK", "BANKER");
      const message = await this.bankClosed();
      await channel.send(message);
    }

    if (args.message === "premint-mart") {
      const channel = await this.getChannel("MART", "MART_CLERK");
      const message = await this.premintMart();
      await channel.send(message);
    }

    if (args.message === "arena-closed") {
      const channel = await this.getChannel("ARENA", "ALLY");
      const message = await this.arenaClosed();
      await channel.send(message);
    }
  }

  async premintMart(): Promise<MessageOptions> {
    const me = Config.emojiCode("MAGIC_EDEN");
    return {
      content: "@everyone",
      embeds: [
        {
          color: "BLUE",
          author: {
            icon_url: "https://s8.gifyu.com/images/MEGAPHONE.png",
            name: "LAST RESTOCK BEFORE MINT",
          },
          image: {
            url: "https://s10.gifyu.com/images/ezgif.com-gif-maker-173287457657b663d7.gif",
          },
          description: dedent`
            @everyone - **MERRIS MART RESTOCKED** ${Config.emojiCode(
              "NUU_PING"
            )}${Config.emojiCode("DEGENZ_RAMEN")}${Config.emojiCode(
            "FAT_PIZZA"
          )}

          This will be the last restock, then ${channelMention(
            Config.channelId("MART")
          )} will be closed until after mint!
            
            Remember, we're minting with ${me} **Magic Eden** <t:1655749800:R>!

            The **ONLY** minting link - https://magiceden.io/launchpad/degenz_game
          `,
        },
      ],
    };
  }

  async arenaClosed(): Promise<MessageOptions> {
    const me = Config.emojiCode("MAGIC_EDEN");
    return {
      embeds: [
        {
          color: "BLUE",
          author: {
            icon_url: "https://s8.gifyu.com/images/MEGAPHONE.png",
            name: "Arena CLOSED until AFTER MINT",
          },
          image: {
            url: "https://s7.gifyu.com/images/ezgif.com-gif-maker-224193a66c6b4ae20d.gif",
          },
          description: dedent`
            **JOIN US IN** ${channelMention(Config.channelId("GENERAL"))}!
            
            We're minting with ${me} **Magic Eden** <t:1655749800:R>!

            The **ONLY** minting link - https://magiceden.io/launchpad/degenz_game
          `,
        },
      ],
    };
  }
  async bankClosed(): Promise<MessageOptions> {
    const me = Config.emojiCode("MAGIC_EDEN");
    return {
      embeds: [
        {
          color: "BLUE",
          author: {
            icon_url: "https://s8.gifyu.com/images/MEGAPHONE.png",
            name: "Bank CLOSED until AFTER MINT",
          },
          image: {
            url: "https://s1.gifyu.com/images/bank-2.gif",
          },
          description: dedent`
            **JOIN US IN** ${channelMention(Config.channelId("GENERAL"))}!
            
            We're minting with ${me} **Magic Eden** <t:1655749800:R>!

            The **ONLY** minting link - https://magiceden.io/launchpad/degenz_game
          `,
        },
      ],
    };
  }

  async tedsClosed(): Promise<MessageOptions> {
    const me = Config.emojiCode("MAGIC_EDEN");
    return {
      embeds: [
        {
          color: "BLUE",
          author: {
            icon_url: "https://s8.gifyu.com/images/MEGAPHONE.png",
            name: "Toss House CLOSED until AFTER MINT",
          },
          image: {
            url: "https://s10.gifyu.com/images/ezgif.com-gif-maker-18deab5ae2e9177377.gif",
          },
          description: dedent`
            **JOIN US IN** ${channelMention(Config.channelId("GENERAL"))}!
            
            We're minting with ${me} **Magic Eden** <t:1655749800:R>!

            The **ONLY** minting link - https://magiceden.io/launchpad/degenz_game
          `,
        },
      ],
    };
  }

  async martClosed(): Promise<MessageOptions> {
    const me = Config.emojiCode("MAGIC_EDEN");
    return {
      embeds: [
        {
          color: "BLUE",
          author: {
            icon_url: "https://s8.gifyu.com/images/MEGAPHONE.png",
            name: "Mart CLOSED until AFTER MINT",
          },
          image: {
            url: "https://s10.gifyu.com/images/ezgif.com-gif-maker-173287457657b663d7.gif",
          },
          description: dedent`
            **JOIN US IN** ${channelMention(Config.channelId("GENERAL"))}!
            
            We're minting with ${me} **Magic Eden** <t:1655749800:R>!

            The **ONLY** minting link - https://magiceden.io/launchpad/degenz_game
          `,
        },
      ],
    };
  }

  async sheltersClosed(): Promise<MessageOptions> {
    const me = Config.emojiCode("MAGIC_EDEN");
    return {
      embeds: [
        {
          color: "BLUE",
          author: {
            icon_url: "https://s8.gifyu.com/images/MEGAPHONE.png",
            name: "Shelters CLOSED until further notice",
          },
          image: {
            url: "https://s8.gifyu.com/images/Alleyway-progress-REVISION.png",
          },
          description: dedent`
            **JOIN US IN** ${channelMention(Config.channelId("GENERAL"))}!
            
            We're minting with ${me} **Magic Eden** <t:1655749800:R>!

            The **ONLY** minting link - https://magiceden.io/launchpad/degenz_game
          `,
        },
      ],
    };
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
