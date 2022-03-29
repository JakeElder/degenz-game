import React from "react";
import { Dormitory } from "data/db";
import { ChannelDescriptor } from "data/types";
import { GuildMember, MessageOptions } from "discord.js";
import { Format } from "lib";
import Utils from "./Utils";
import { channelMention, Embed, userMention } from "@discordjs/builders";
import pluralize from "pluralize";
import Config from "config";

const { r } = Utils;

type Params = {
  channel: ChannelDescriptor;
  member: GuildMember;
  dormitories: Dormitory[];
};

const globalCommands = [
  <>**`/eat`** - Eat food from your inventory.</>,
  <>**`/stats`** - Check your own or someone elses stats.</>,
  <>**`/inventory`** - Check your own or someone elses inventory.</>,
  <>**`/recruit`** - Invite Degenz into the server.</>,
  <>**`/recruited`** - Check how many Degenz you've invited.</>,
];

export class Help {
  static generate(params: Params): MessageOptions {
    const { channel } = params;

    if (channel.isDormitory) {
      return this.makeDormitoryMessage(params);
    }

    if (channel.isOnboardingThread || channel.isApartment) {
      return this.makeTenancyMessage(params);
    }

    if (channel.isCell) {
      return this.makeCellMessage(params);
    }

    if (channel.isTossHouse) {
      return this.makeTossHouseMessage(params);
    }

    if (channel.isTownSquare) {
      return this.makeTownSquareMessage(params);
    }

    if (channel.isMart) {
      return this.makeMartMessage(params);
    }

    if (channel.isBank) {
      return this.makeBankMessage(params);
    }

    if (channel.isArena) {
      return this.makeArenaMessage(params);
    }

    if (channel.isArmory) {
      return this.makeArmoryMessage(params);
    }

    if (channel.isTrainingDojo) {
      return this.makeTrainingDojoMessage(params);
    }

    if (channel.isVerification) {
      return this.makeVerificationMessage(params);
    }

    if (channel.isGenPop) {
      return this.makeGenPopMessage(params);
    }

    if (channel.isCommunity) {
      return this.makeCommunityMessage(params);
    }

    if (channel.isTavern) {
      return this.makeTavernMessage(params);
    }

    return this.makeWIPMessage();
  }
  static makeMessageOptions({
    title,
    description,
    fields,
    image,
  }: Pick<
    Embed,
    "title" | "description" | "fields" | "image"
  >): MessageOptions {
    return {
      embeds: [
        {
          title,
          color: "DARK_BLUE",
          description,
          fields,
          image: image || {
            url: "https://s1.gifyu.com/images/art-placeholder.gif",
          },
        },
      ],
    };
  }

  static makeWIPMessage(): MessageOptions {
    const commands = [
      <>`/coming-soon` - Commands for this room will be documented soon.</>,
    ];

    return this.makeMessageOptions({
      title: "WIP",
      description: "The description of this channel is currently unavailable.",
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
      ],
    });
  }

  static makeDormitoryMessage({
    dormitories,
    channel,
  }: Params): MessageOptions {
    const commands = globalCommands;

    const d = dormitories.map((dorm) => (
      <>
        {dorm.activeEmoji} `{dorm.symbol}` - `{dorm.tenancies.length}{" "}
        {pluralize("citizen", dorm.tenancies.length)}`
      </>
    ));

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is one of our luxury dormitories in **
          {Format.worldName()}**. Those who aren't valued enough to have their
          own *private apartment* will be assigned a space in one of our dorms
          to receive game notifications.
        </>
      ),
      fields: [
        { name: "Dormitories", value: d.map((c) => r(c)).join("\n") },
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
      ],
      image: {
        url: "https://s7.gifyu.com/images/ezgif.com-gif-maker-2044e60da18b84319b.gif",
      },
    });
  }

  static makeTenancyMessage({ channel }: Params): MessageOptions {
    const commands = globalCommands;

    let plannedCommands = [
      <>**`/sleep`** - Sleep to replenish your strength.</>,
    ];

    if (channel.isApartment) {
      plannedCommands.push(
        <>**`/invite`** - Grant other Degenz access to your apartment.</>,
        <>**`/evict`** - Revoke access to other tenants of your apartment.</>
      );
    }

    const description = channel.isApartment
      ? r(
          <>
            {channelMention(channel.id)} is your own personal space.. *For
            now*.. Safe from Big Brother.. **Most** of the time. He's been known
            to occasionally make surprise appearances and shake Degenz down.
          </>
        )
      : r(
          <>
            {channelMention(channel.id)} is your dormitory onboarding thread.
            Now you're a Degen, once you've finished learning about the game
            you'll be greeted in to your dormitory and start working your way up
            the Degen ranks.
          </>
        );

    return this.makeMessageOptions({
      title: channel.name,
      description,
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
        {
          name: "Planned Commands",
          value: plannedCommands.map((c) => r(c)).join("\n"),
        },
      ],
      image: {
        url: "https://s7.gifyu.com/images/ezgif.com-gif-maker-2044e60da18b84319b.gif",
      },
    });
  }

  static makeCellMessage({ channel }: Params): MessageOptions {
    const commands = [
      <>
        **`/bribe`** - Occasionally {userMention(Config.clientId("WARDEN"))} has
        been known to reveal the cell release pin in exchange for
        {Format.token()}.
      </>,
      <>
        **`/escape`** - Escape with the help of institutionalised long term con{" "}
        {userMention(Config.clientId("PRISONER"))}.
      </>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is your **new home**. For now.. Maybe
          institutionalised prisoner {userMention(Config.clientId("PRISONER"))}{" "}
          will help you escape.
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
      ],
      image: { url: "https://s10.gifyu.com/images/Prison_Degenz-min.gif" },
    });
  }

  static makeTossHouseMessage({ channel }: Params): MessageOptions {
    const commands = [
      <>**`/toss`** - Toss a coin with another player or Tosser Ted.</>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is where you can flip coins with people.
          Gamble with other Degens or bet against the house,{" "}
          {userMention(Config.clientId("TOSSER"))}.
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
      ],
      image: {
        url: "https://s10.gifyu.com/images/ezgif.com-gif-maker-18deab5ae2e9177377.gif",
      },
    });
  }

  static makeTownSquareMessage({ channel }: Params): MessageOptions {
    const commands = globalCommands;

    const plannedCommands = [
      <>**`/beg`** - When you're down and out you still need to eat.</>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is the Degenz general chat channel.
          Discuss Degen matters, hang out and eat food. Just remember,{" "}
          {userMention(Config.clientId("BIG_BROTHER"))} is watching.{" "}
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
        {
          name: "Planned Commands",
          value: plannedCommands.map((c) => r(c)).join("\n"),
        },
      ],
      // image: { url: "" },
    });
  }

  static makeMartMessage({ channel }: Params): MessageOptions {
    const commands = [
      <>
        **`/stock`** - Check what old lady{" "}
        {userMention(Config.clientId("MART_CLERK"))} has in stock.
      </>,
      <>**`/buy`** - Buy something that remains in stock.</>,
      <>**`/eat`** - Eat food from your inventory.</>,
    ];

    const plannedCommands = [
      <>**`/steal`** - When times are hard, be positive. And steal stuff.</>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is where you can buy state approved items
          that help you survive in **{Config.general("WORLD_NAME")}
          **. Make sure you buy items quickly as stock is limited.
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
        {
          name: "Planned Commands",
          value: plannedCommands.map((c) => r(c)).join("\n"),
        },
      ],
      image: {
        url: "https://s10.gifyu.com/images/ezgif.com-gif-maker-173287457657b663d7.gif",
      },
    });
  }

  static makeBankMessage({ channel }: Params): MessageOptions {
    const commands = [
      <>**`/balance`** - Check your {Format.token()} balance.</>,
      <>**`/transfer`** - Transfer {Format.token()} to another Degen.</>,
    ];

    const plannedCommands = [
      <>
        **`/borrow`** - Take out a *low, low interest* {Format.token()} loan.
      </>,
      <>
        **`/steal`** - Steal from the bank, if you think you're good enough..
      </>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is where you.. *Bank*. Check your balance
          and transfer {Format.token()} to other Degens. If{" "}
          {userMention(Config.clientId("BANKER"))} isn't on the phone that is.
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
        {
          name: "Planned Commands",
          value: plannedCommands.map((c) => r(c)).join("\n"),
        },
      ],
      image: {
        url: "https://s1.gifyu.com/images/bank-29240c53376fa766b.gif",
      },
    });
  }

  static makeArenaMessage({ channel }: Params): MessageOptions {
    const commands = [
      <>**`/hack`** - Hack another Degen for fun and profit.</>,
      <>
        **`/shield`** - Use one of your shields to defend yourself from attacks.
      </>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is{" "}
          {userMention(Config.clientId("BIG_BROTHER"))}
          's battle grounds. The Beautopian Elite has a somewhat sadistic idea
          of what is entertaining..
          <br />
          Some Degens fight because they're fighters. Most fight to survive. But
          one thing is clear, under state orders, *everyone* must fight.{" "}
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
      ],
      // image: { url: "" },
    });
  }

  static makeArmoryMessage({ channel }: Params): MessageOptions {
    const commands = [
      <>**`/buy-shield`** - Buy a shield.</>,
      <>**`/buy-hack`** - Buy a hack.</>,
      <>**`/sell-hack`** - Sell a hack.</>,
      <>**`/sell-shield`** - Sell a shield.</>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is for all your hack and shield
          purchasing needs. Be careful, the store keeper veteran{" "}
          {userMention(Config.clientId("ARMORY_CLERK"))} can be paranoid. He has
          a tendency to have aggressive outputs and keep customers{" "}
          {Format.token()}.
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
      ],
      image: {
        url: "https://s10.gifyu.com/images/ezgif.com-gif-maker-1696ae238f96d4dfc1.gif",
      },
    });
  }

  static makeTrainingDojoMessage({ channel }: Params): MessageOptions {
    const commands = [
      <>**`/hack`** - Hack another Degen for fun and profit.</>,
      <>
        **`/shield`** - Use one of your shields to defend yourself from attacks.
      </>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is where{" "}
          {userMention(Config.clientId("SENSEI"))} will guide you in the ways of
          **Degen hacker battle**. Press the "LFG" button to begin your
          training.
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
      ],
      image: { url: "https://s10.gifyu.com/images/Sensei-Trainer.gif" },
    });
  }

  static makeVerificationMessage({ channel }: Params): MessageOptions {
    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} - React to the message so we know you're
          not a bot.{" "}
        </>
      ),
      fields: [],
      // image: { url: "" },
    });
  }

  static makeGenPopMessage({ channel }: Params): MessageOptions {
    const commands = [
      <>
        **`/bribe`** - Occasionally {userMention(Config.clientId("WARDEN"))} has
        been known to reveal the cell release pin in exchange for{" "}
        {Format.token()}.
      </>,
      <>
        **`/escape`** - Escape with the help of institutionalised long term con{" "}
        {userMention(Config.clientId("PRISONER"))}.
      </>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} the place where **criminals** hang out.
          If you're planning an escape maybe you can chat with the other
          **degenerates** here.
        </>
      ),
      fields: [
        { name: "Commands", value: commands.map((c) => r(c)).join("\n") },
      ],
      // image: { url: "" },
    });
  }

  static makeCommunityMessage({ channel }: Params): MessageOptions {
    const channels = [
      <>
        {channelMention(Config.channelId("GENERAL"))} - For general chat about
        the server.
      </>,
      <>
        {channelMention(Config.channelId("FEEDBACK"))} - If there's any
        strangeness in the game, report it in here.
      </>,
      <>
        {channelMention(Config.channelId("ANNOUNCEMENTS"))} - We'll let you know
        when there's news in here.
      </>,
      <>
        {channelMention(Config.channelId("LEADERBOARD"))} - See who's killing it
        in the game.
      </>,
      <>
        {channelMention(Config.channelId("HALL_OF_PRIVACY"))} - **Big Brother**
        keeps an eye on everything in {Config.general("WORLD_NAME")} and logs it
        here. For safety of course.
      </>,
      <>
        {channelMention(Config.channelId("FAQ"))} - Learn more about the Degenz
        game server.
      </>,
    ];

    return this.makeMessageOptions({
      title: "Community Channels",
      description: r(
        <>
          The community area is outside of {Config.general("WORLD_NAME")}. Come
          here to to learn more about the Degenz game. **If you're not in game
          already**, go to{" "}
          {channelMention(Config.channelId("ENTER_THE_SHELTERS"))} to get a
          space in one of our **luxury dormitories**.
          <br />
        </>
      ),
      fields: [
        { name: "Channels", value: channels.map((c) => r(c)).join("\n") },
      ],
      image: { url: "https://s10.gifyu.com/images/header-smaller.gif" },
    });
  }

  static makeTavernMessage({ channel }: Params): MessageOptions {
    const plannedCommands = [
      <>**`/drink`** - Enjoy a Degenz Brew.</>,
      <>**`/gift`** - Gift a fellow Degen a brew.</>,
    ];

    return this.makeMessageOptions({
      title: channel.name,
      description: r(
        <>
          {channelMention(channel.id)} is where the Degenz hang out. The owner,
          "Rumer" has been known to post insider tips from popular DAOs across
          the scene.
        </>
      ),
      fields: [
        {
          name: "Planned Commands",
          value: plannedCommands.map((c) => r(c)).join("\n"),
        },
      ],
      image: { url: "https://s1.gifyu.com/images/final-tavern-b.gif" },
    });
  }
}
