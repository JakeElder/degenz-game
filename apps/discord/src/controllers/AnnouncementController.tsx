import React from "react";
import { MessageOptions, TextChannel } from "discord.js";
import Utils from "../Utils";
import Config from "config";
import { ChannelMention, RoleMention } from "../legacy/templates";
import { Format } from "lib";
import { AppState } from "data/db";
import cron from "node-cron";

export default class AnnouncementController {
  static channel: TextChannel;
  static state: AppState;
  static interval = 1000 * 60 * 20;
  static infoCount = 0;
  static promptCount = 0;

  static async init() {
    [this.channel, this.state] = await Promise.all([
      Utils.ManagedChannel.getOrFail("GENERAL", "ALLY"),
      AppState.findOneByOrFail({ id: "CURRENT" }),
    ]);

    this.initCron();
  }

  static initCron() {
    cron.schedule("*/30 * * * *", () => {
      this.tick();
    });
  }

  static async tick() {
    let message: MessageOptions | null = null;
    const count = this.state.announcementCount;

    if (count % 4 === 0) {
      const prompts = this.getPromptMessages();
      message = prompts[this.promptCount % prompts.length];
      this.promptCount++;
    } else {
      message = this.getInfoMessage();
    }

    await this.channel.send(message);

    this.state.announcementCount++;
    await this.state.save();
  }

  static getPromptMessages() {
    const pregenMessage: MessageOptions = {
      embeds: [
        {
          title: "Finish a Quest",
          color: "BLUE",
          thumbnail: {
            url: "https://s8.gifyu.com/images/ezgif.com-gif-maker-278abf1958e94d842d2.gif",
          },
          description: Utils.r(
            <>
              {Config.emojiCode("BABY")}{" "}
              <RoleMention id={Config.roleId("PREGEN")} /> role holders
              <br />
              <br />
              **Go to** <ChannelMention id={Config.channelId("QUESTS")} /> and
              complete **one quest** to get rid of the{" "}
              {Config.emojiCode("BABY")} baby role and become part of the *Degen
              army*.
            </>
          ),
        },
      ],
    };

    const warningMessage: MessageOptions = {
      embeds: [
        {
          title: "Be Careful",
          color: "RED",
          thumbnail: {
            url: "https://s8.gifyu.com/images/ezgif.com-gif-maker-23203b9dca779ba7cf-1.gif",
          },
          description: Utils.r(
            <>
              **⚠️ WE WILL NEVER DM YOU FIRST ⚠️**
              <br />
              <br />
              The **Degenz Team** will **Never** DM you first. Only follow links
              that we post in these channels;
              <br />
              <br />
              <ChannelMention id={Config.channelId("ANNOUNCEMENTS")} />
              <br />
              <ChannelMention id={Config.channelId("UPDATES")} />
              <br />
              <ChannelMention id={Config.channelId("OFFICIAL_LINKS")} />
              <br />
              <br />
              Report scammers to us for {Config.emojiCode("GBT_COIN")} rewards.
              **Stay safe Degenz** ❤️.
            </>
          ),
        },
      ],
    };

    const wlMessage: MessageOptions = {
      embeds: [
        {
          title: "Confirm Your Whitelist",
          color: "BLUE",
          thumbnail: {
            url: "https://s8.gifyu.com/images/OG-Whitelist-pass-finald2d84ef13cf27267.png",
          },
          description: Utils.r(
            <>
              {Config.emojiCode("WHITELIST_BW")}{" "}
              <RoleMention id={Config.roleId("WHITELIST")} /> role holders
              <br />
              {Config.emojiCode("OG_WHITELIST_BW")}{" "}
              <RoleMention id={Config.roleId("OG_WHITELIST")} /> role holders
              <br />
              <br />
              **Go to <ChannelMention id={Config.channelId("SUBMIT_WALLET")} />
              ** and submit your wallet to confirm your wl position
              <br />
              <br />
            </>
          ),
        },
      ],
    };

    return [pregenMessage, warningMessage, wlMessage];
  }

  static getInfoMessage() {
    const reactForRewards: MessageOptions = {
      embeds: [
        {
          title: "React to Earn $GBT",
          color: "BLUE",
          description: Utils.r(<ReactForRewards />),
          thumbnail: {
            url: "https://s8.gifyu.com/images/2022-05-25-12.26.231f8dccdbe6ec69f2.gif",
          },
        },
      ],
    };

    const shopWithJohnny: MessageOptions = {
      embeds: [
        {
          title: "Shop with Jpeg Johnny",
          color: "BLUE",
          description: Utils.r(<ShopWithJohnny />),
          thumbnail: {
            url: "https://s8.gifyu.com/images/ezgif.com-gif-maker-23203b9dca779ba7cf-12.gif",
          },
        },
      ],
    };

    const winDailyRaffle: MessageOptions = {
      embeds: [
        {
          title: "Win 100 $USD Every Day",
          color: "GOLD",
          description: Utils.r(<WinUSD />),
          thumbnail: {
            url: "https://s8.gifyu.com/images/giphy871c3b6222732b0d.gif",
          },
        },
      ],
    };

    const messages = [reactForRewards, shopWithJohnny, winDailyRaffle];
    const message = messages[this.infoCount % messages.length];

    this.infoCount++;

    return message;
  }
}

const WinUSD = ({}: {}) => {
  return (
    <>
      Want to win **💰*$100**? We're giving away $100 worth of Solana **Every
      Day**. All you have to do is.
      <br />
      <br />
      {Utils.numberEmoji(0)} Invite one person
      <br />
      {Utils.numberEmoji(1)} Make sure that person completes one quest in{" "}
      <ChannelMention id={Config.channelId("QUESTS")} />
      <br />
      <br />
      So **go to** <ChannelMention id={Config.channelId("INVITE")} /> and get
      your invite link now!
    </>
  );
};

const ShopWithJohnny = ({}: {}) => {
  return (
    <>
      Want to spend your {Config.emojiCode("GBT_COIN")} **$GBT**? **Go to**{" "}
      <ChannelMention id={Config.channelId("JPEG_STORE")} /> where you can..
      <br />
      <br />
      🎟️ **Enter raffes!**
      <br />
      🌃 **Win NFT's**
      <br />
      {Config.emojiCode("OG_WHITELIST")} **Win Whitelist Spots**!
      <br />
      <br />
      Good luck Degenz!
    </>
  );
};

const ReactForRewards = ({}: {}) => {
  return (
    <>
      Want to earn {Config.emojiCode("GBT_COIN")} **$GBT**?
      <br />
      <br />
      **Reacting** to messages in the following channels will earn you{" "}
      {Format.currency(10)} per reaction, with a limit of {Format.currency(100)}{" "}
      per message.
      <br />
      <br />
      <ChannelMention id={Config.channelId("NFT_CHARACTERS")} />
      <br />
      <ChannelMention id={Config.channelId("THE_LORE")} />
      <br />
      <ChannelMention id={Config.channelId("ANNOUNCEMENTS")} />
      <br />
      <ChannelMention id={Config.channelId("UPDATES")} />
      <br />
      <br />
      And maybe others 🤫
    </>
  );
};
