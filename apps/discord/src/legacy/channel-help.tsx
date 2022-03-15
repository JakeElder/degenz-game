import { GuildMember, TextBasedChannel } from "discord.js";
import React from "react";
import Config from "config";
import { Imprisonment, User as UserType } from "data/db";
import { Channel, User } from "./templates";
import { currency } from "./utils";

const Info = ({
  channelName,
  children,
  commands = [],
  plannedCommands = [],
}: {
  channelName: string;
  children: React.ReactNode;
  commands?: React.ReactNode[];
  plannedCommands?: React.ReactNode[];
}) => {
  return (
    <>
      {">>> "}`{channelName.toUpperCase()}`
      <br />
      <br />
      **Channel Info**
      <br />
      {children}
      {commands.length > 0 ? (
        <>
          <br />
          <br />
          **Commands**
          <br />
          {commands.map((c, idx) => (
            <React.Fragment key={idx}>
              {c}
              <br />
            </React.Fragment>
          ))}
        </>
      ) : null}
      {plannedCommands.length > 0 ? (
        <>
          <br />
          **Planned Commands**
          <br />
          {plannedCommands.map((c, idx) => (
            <React.Fragment key={idx}>
              {c}
              <br />
            </React.Fragment>
          ))}
        </>
      ) : null}
    </>
  );
};

export const ChannelHelpOutput = ({
  channel,
  member,
  type = "WORLD",
  cellNumber,
  apartmentUser,
}: {
  channel: TextBasedChannel;
  member: GuildMember;
  type?: "WORLD" | "APARTMENT" | "CELL";
  cellNumber?: Imprisonment["cellNumber"] | null;
  apartmentUser?: UserType | null;
}) => {
  if (type === "APARTMENT") {
    return (
      <Info
        channelName={`${apartmentUser!.displayName}'s Apartment`}
        commands={[
          <>**`/eat`** - Eat food from your inventory.</>,
          <>**`/stats`** - Check your own or someone elses stats.</>,
          <>**`/inventory`** - Check your own or someone elses inventory.</>,
        ]}
        plannedCommands={[
          <>**`/sleep`** - Sleep to replenish your energy.</>,
          <>**`/invite`** - Grant other Degenz access to your apartment.</>,
          <>**`/evict`** - Revoke access to other tenants of your apartment.</>,
        ]}
      >
        <Channel id={channel.id} /> is your own personal space.. *For now*..
        Safe from <User id={Config.clientId("BIG_BROTHER")} />
        .. **Most** of the time. He's been known to occasionally make guest
        appearances and shake Degenz down.
      </Info>
    );
  }

  if (type === "CELL") {
    return (
      <Info
        channelName={`Cell ${cellNumber!.toString().padStart(2, "0")}`}
        commands={[
          <>**`/bribe`** - Eat food from your inventory.</>,
          <>**`/escape`** - Check your own or someone elses stats.</>,
        ]}
      >
        <Channel id={channel.id} /> is your **new home**. For now.. Maybe
        institutionalised prisoner <User id={Config.clientId("PRISONER")} />{" "}
        will help you escape.
      </Info>
    );
  }

  if (channel.id === Config.channelId("TOSS_HOUSE")) {
    return (
      <Info
        channelName="Teds Toss House"
        commands={[
          <>**`/toss`** - Toss a coin with another player or Tosser Ted.</>,
        ]}
      >
        <Channel id={Config.channelId("TOSS_HOUSE")} /> is where you can flip
        coins with people. Gamble with other Degens or bet against the house,{" "}
        <User id={Config.clientId("TOSSER")} />.
      </Info>
    );
  }

  if (channel.id === Config.channelId("TOWN_SQUARE")) {
    return (
      <Info
        channelName="Town Square"
        commands={[
          <>**`/eat`** - Eat food from your inventory.</>,
          <>**`/stats`** - Check your own or someone elses stats.</>,
          <>**`/inventory`** - Check your own or someone elses inventory.</>,
        ]}
        plannedCommands={[
          <>**`/beg`** - When you're down and out you still need to eat.</>,
        ]}
      >
        <Channel id={Config.channelId("TOWN_SQUARE")} /> is the Degenz general
        chat channel. Discuss Degen matters, hang out and eat food. Just
        remember, <User id={Config.clientId("BIG_BROTHER")} /> is watching.
      </Info>
    );
  }

  if (channel.id === Config.channelId("MART")) {
    return (
      <Info
        channelName="Merris Mart"
        commands={[
          <>
            **`/stock`** - Check what old lady{" "}
            <User id={Config.clientId("MART_CLERK")} /> has in stock.
          </>,
          <>**`/buy`** - Buy something that remains in stock.</>,
        ]}
        plannedCommands={[
          <>
            **`/steal`** - When times are hard, be positive. And steal stuff.
          </>,
        ]}
      >
        <Channel id={Config.channelId("MART")} /> is where you can buy state
        approved items that help you survive in **{Config.general("WORLD_NAME")}
        **. Make sure you buy items quickly as stock is limited.
      </Info>
    );
  }

  if (channel.id === Config.channelId("BANK")) {
    return (
      <Info
        channelName="Bank of Beautopia"
        commands={[
          <>**`/balance`** - Check your {currency()} balance.</>,
          <>**`/transfer`** - Transfer {currency()} to another Degen.</>,
        ]}
        plannedCommands={[
          <>
            **`/borrow`** - Take out a *low, low interest* {currency()} loan.
          </>,
          <>
            **`/steal`** - Steal from the bank, if you think you're good
            enough..
          </>,
        ]}
      >
        <Channel id={Config.channelId("BANK")} /> is where you.. *Bank*. Check
        your balance and transfer {currency()} to other Degens. If{" "}
        <User id={Config.clientId("BANKER")} /> isn't on the phone that is.
      </Info>
    );
  }

  if (channel.id === Config.channelId("ARENA")) {
    return (
      <Info
        channelName="The Arena"
        commands={[
          <>**`/hack`** - Hack another Degen for fun and profit.</>,
          <>
            **`/defend`** - Use one of your shields to defend yourself from
            attacks.
          </>,
        ]}
      >
        <Channel id={Config.channelId("ARENA")} /> is{" "}
        <User id={Config.clientId("BIG_BROTHER")} />
        's battle grounds. The Beautopian Elite has a somewhat sadistic idea of
        what is entertaining..
        <br />
        Some Degens fight because they're fighters. Most fight to survive. But
        one thing is clear, under state orders, *everyone* must fight.
      </Info>
    );
  }

  if (channel.id === Config.channelId("BANK")) {
    return (
      <Info
        channelName="Bank of Beautopia"
        commands={[
          <>**`/balance`** - Check your {currency()} balance.</>,
          <>**`/transfer`** - Transfer {currency()} to another Degen.</>,
        ]}
        plannedCommands={[
          <>**`/borrow`** - Take out a *low interest* {currency()} loan.</>,
          <>
            **`/steal`** - Steal from the bank, if you think you're good
            enough..
          </>,
        ]}
      >
        <Channel id={Config.channelId("BANK")} /> is where you.. *Bank*. Check
        your balance and transfer {currency()} to other Degens. If{" "}
        <User id={Config.clientId("BANKER")} /> isn't on the phone that is.
      </Info>
    );
  }

  if (channel.id === Config.channelId("ARMORY")) {
    return (
      <Info
        channelName="The Armory"
        commands={[
          <>**`/buy-shield`** - Buy a shield.</>,
          <>**`/buy-hack`** - Buy a hack.</>,
        ]}
      >
        <Channel id={Config.channelId("ARMORY")} /> is for all your hack and
        shield purchasing needs. Be careful, the store keeper veteran{" "}
        <User id={Config.clientId("ARMORY_CLERK")} /> can be paranoid. He has a
        tendency to have aggressive outputs and keep customers {currency()}.
      </Info>
    );
  }

  if (channel.id === Config.channelId("TRAINING_DOJO")) {
    return (
      <Info
        channelName="Training Dojo"
        commands={[
          <>**`/hack`** - Hack another Degen for fun and profit.</>,
          <>
            **`/defend`** - Use one of your shields to defend yourself from
            attacks.
          </>,
        ]}
      >
        <Channel id={Config.channelId("TRAINING_DOJO")} /> is where{" "}
        <User id={Config.clientId("SENSEI")} /> will guide you in the ways of
        **Degen hacker battle**. Press the "Get started" button to begin your
        training.
      </Info>
    );
  }

  if (channel.id === Config.channelId("VERIFICATION")) {
    return (
      <Info channelName="Verification">
        <Channel id={Config.channelId("VERIFICATION")} /> - React to the message
        so we know you're not a bot.
      </Info>
    );
  }

  if (channel.id === Config.channelId("GEN_POP")) {
    return (
      <Info
        channelName="Gen Pop"
        commands={[
          <>
            **`/bribe`** - Occasionally <User id={Config.clientId("WARDEN")} />{" "}
            has been known to reveal the cell release pin in exchange for{" "}
            {currency({ long: false, bold: false })}.
          </>,
          <>
            **`/escape`** - Escape with the help of institutionalised long term
            con <User id={Config.clientId("PRISONER")} />.
          </>,
        ]}
      >
        <Channel id={Config.channelId("GEN_POP")} /> - the place where
        **criminals** hang out. If you're planning an escape maybe you can chat
        with the other **degenerates** here.
      </Info>
    );
  }

  const COMMUNITY_CHANNELS = [
    Config.channelId("GENERAL"),
    Config.channelId("ENTER_THE_PROJECTS"),
    Config.channelId("ENTER_THE_SHELTERS"),
    Config.channelId("FEEDBACK"),
    Config.channelId("ANNOUNCEMENTS"),
    Config.channelId("LEADERBOARD"),
    Config.channelId("HALL_OF_PRIVACY"),
    Config.channelId("FAQ"),
    Config.channelId("COMMANDS"),
  ];

  if (COMMUNITY_CHANNELS.includes(channel.id)) {
    return (
      <>
        {">>> "}`COMMUNITY CHANNELS`
        <br />
        <br />
        **Area Info**
        <br />
        The community area is outside of {Config.general("WORLD_NAME")}. Come
        here to to learn more about the Degenz game.
        <br />
        <br />
        **Channels**
        <br />
        <Channel id={Config.channelId("GENERAL")} /> - For general chat about
        the server.
        <br />
        <Channel id={Config.channelId("FEEDBACK")} /> - If there's any
        strangeness in the game, report it in here.
        <br />
        <Channel id={Config.channelId("ANNOUNCEMENTS")} /> - We'll let you know
        when there's news in here.
        <br />
        <Channel id={Config.channelId("LEADERBOARD")} /> - See who's killing it
        in the game.
        <br />
        <Channel id={Config.channelId("HALL_OF_PRIVACY")} /> - **Big Brother**
        keeps an eye on everything in {Config.general("WORLD_NAME")} and logs it
        here. For safety of course.
        <br />
        <Channel id={Config.channelId("FAQ")} /> - Learn more about the Degenz
        game server.
        <br />
      </>
    );
  }

  return (
    <Info
      channelName="WIP"
      commands={[
        <>`/coming-soon` - Commands for this room will be documented soon.</>,
      ]}
    >
      The description of this channel is currently unavailable.
    </Info>
  );
};

export default ChannelHelpOutput;
