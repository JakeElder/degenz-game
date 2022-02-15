import React from "react";
import {
  Channel as DiscordChannel,
  GuildMember,
  TextChannel,
} from "discord.js";
import { userMention } from "@discordjs/builders";
import emoji from "node-emoji";
import Config from "app-config";
import {
  EnterEvent,
  Events,
  ImprisonEvent,
  FailedTossEvent,
  FailedTransferEvent,
  ReleaseEvent,
  SuccessfulTossEvent,
  SuccessfulTransferEvent,
} from "./events";
import { currency } from "./utils";
import { TossGame } from "./types";
import {
  BalanceCheckedEvent,
  MartItemPurchasedEvent,
  TokenTransferEvent,
} from "./world-events";

////////////////////////////////////////////////////////////////////////////////
// General
////////////////////////////////////////////////////////////////////////////////

const Currency = ({
  singular = false,
  bold = false,
}: {
  singular?: boolean;
  bold?: boolean;
}) => {
  return <>{currency({ plural: !singular, bold })}</>;
};

export const User = ({ id }: { id: GuildMember["id"] }) => (
  <>{userMention(id)}</>
);

export const Channel = ({ id }: { id: DiscordChannel["id"] }) => (
  <>{`<#${id}>`}</>
);

export const Balance = ({ tokens }: { tokens: number }) => (
  <>
    {emoji.get("moneybag")} {tokens}
  </>
);

export const GameWelcomeMessage = ({ member }: { member: GuildMember }) => (
  <>
    **Welcome! Comrade <User id={member.id} /> to the{" "}
    {Config.general("WORLD_NAME").toUpperCase()} BETA**
    <br />
    The state has been kind enough to issue you with **100 <Currency />
    **!
    <br />
    To find out where you can use these tokens, use the `/info` command
  </>
);

////////////////////////////////////////////////////////////////////////////////
// Tosser Ted
////////////////////////////////////////////////////////////////////////////////

export const TossChallengeInvitation = ({
  timeout,
  challenger,
  challengee,
  amount,
}: {
  timeout?: boolean;
  challenger: GuildMember;
  challengee: GuildMember;
  amount: number;
}) => {
  if (timeout) {
    return (
      <>
        <User id={challengee.id} /> - <User id={challenger.id} /> challenged you
        to a coin flip for {amount} <Currency bold />. But you didn't respond in
        time.
      </>
    );
  }
  return (
    <>
      <User id={challengee.id} /> - <User id={challenger.id} /> has challenged
      you to a coin flip for {amount} <Currency bold />. Do you accept? Or are
      you {emoji.get("chicken")}?
    </>
  );
};

export const InsufficientFundsTossReply = ({ amount }: { amount: number }) => (
  <>
    Pal you think I'm stupid? You don't *have* **{amount}** <Currency bold /> to
    bet. Get outta here you bum.
  </>
);

export const TossChoiceTimeoutPrompt = () => (
  <>
    I said I ain't got all day. What, you can't choose heads or tails in less
    than 30 seconds?
  </>
);

export const TossResponseTimeout = () => (
  <>
    I said I ain't got all day. What, you can't choose heads or tails in less
    than 30 seconds?
  </>
);

export const TossChoicePrompt = () => (
  <>Whats your choice pal, I ain't got all day.. Head or Tails?</>
);

export const TossResultPublic = (props: TossGame) => {
  return (
    <>
      `TOSS_RESULT` **{props.challenger.member.displayName}**{" "}
      {props.winner === "CHALLENGER" ? "won" : "lost"} {props.amount}{" "}
      {currency()} {props.winner === "CHALLENGER" ? "from" : "to"} **
      {props.challengee.member.displayName}**
    </>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Banker Beatrice
////////////////////////////////////////////////////////////////////////////////

export const InsufficientFundsTransferReply = ({
  recipient,
  amount,
}: {
  recipient: GuildMember;
  amount: number;
}) => (
  <>
    You don't *have* {amount} <Currency /> to send to <User id={recipient.id} />
    ,dumb dumb.
  </>
);

export const TransferSuccessfulReply = ({
  recipient,
  amount,
  balance,
}: {
  recipient: GuildMember;
  amount: number;
  balance: number;
}) => (
  <>
    Transferred **{amount} <Currency /> ** to <User id={recipient.id} />. How
    nice of you. Your new balance is **{balance}**
  </>
);

export const BalanceResultPublic = (p: BalanceCheckedEvent) => {
  return (
    <>
      `{p.event}` **{p.data.member.displayName}** checked their balance and has{" "}
      **{p.data.balance}
      {currency({ long: false, bold: false })}**.
    </>
  );
};

export const TransferResultPublic = (p: TokenTransferEvent) => {
  return (
    <>
      `{p.event}` **{p.data.member.displayName}** transferred **{p.data.amount}{" "}
      {currency({ long: false, bold: false })}** to **
      {p.data.recipient.displayName}**.
    </>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Hugh Donie
////////////////////////////////////////////////////////////////////////////////

export const SuccessfulEscapeMessage = ({ code }: { code: string }) => {
  return <>Bro `{code}` is the correct code! Run for it!</>;
};

export const FailedEscapeMessage = ({ code }: { code: string }) => {
  return (
    <>
      Bro what are you doing? `{code}` isn't the correct code.. two more failed
      attempts and we'll be in line for beatings!
    </>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Walden
////////////////////////////////////////////////////////////////////////////////

export const SuccessfulBribeReply = ({
  amount,
  citizenId,
}: {
  amount: number;
  citizenId: string;
}) => {
  return (
    <>
      Ok, <User id={citizenId} /> `{amount}` <Currency bold /> will do. The door
      code is `2345`. I'm sure you'll be back, degenerate.
    </>
  );
};

export const FailedBribeReply = ({
  amount,
  citizenId,
}: {
  amount: number;
  citizenId: string;
}) => {
  return (
    <>
      I'm insulted, <User id={citizenId} />. You think I can be bought for `
      {amount}` <Currency bold />? Just for that, I'll be keeping your{" "}
      <Currency /> and you **won't** be getting the exit code.
    </>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Merris
////////////////////////////////////////////////////////////////////////////////

export const MartItemPurchaseResult = (p: MartItemPurchasedEvent) => {
  return (
    <>
      `{p.event}` **{p.data.member.displayName}** bought **{p.data.item.name}**.
    </>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Ivan 6000
////////////////////////////////////////////////////////////////////////////////

export const FirstActivityReply = ({ choice }: { choice: string }) => {
  if (choice === "fight") {
    return (
      <>
        If you want to learn to hacker battle, go and see{" "}
        <User id={Config.clientId("SENSEI")} /> in the
        <Channel id={Config.channelId("TRAINING_DOJO")} /> channel. Just press
        the "Get started" button when you get in there.
      </>
    );
  }

  if (choice === "gamble") {
    return (
      <>
        If you want to gamble, go and see{" "}
        <User id={Config.clientId("TOSSER")} /> in{" "}
        <Channel id={Config.channelId("TOSS_HOUSE")} /> channel. Remember to
        type the `/help` command when you get there.
      </>
    );
  }

  if (choice === "shop") {
    return (
      <>
        If you want to shop, go and see{" "}
        <User id={Config.clientId("MART_CLERK")} /> in{" "}
        <Channel id={Config.channelId("MART")} /> channel. Remember to type the
        `/help` command when you get there.
      </>
    );
  }

  return null;
};

export const AllyOnboardMessageOne = ({
  member,
  part,
  response,
}: {
  member: GuildMember;
  part: 1 | 2 | 3 | 4 | 5;
  response?: string;
}) => {
  if (part === 1) {
    return <>Has he left the room?</>;
  }

  if (part === 2) {
    if (response === "yes") {
      return (
        <>
          Right, I can see he's not in your apartments user list now. Big
          Brother creeps me out.
        </>
      );
    }

    if (response === "no") {
      return (
        <>
          Bro are you slow? Check the user room user list, it's only me and you
          in here now. Anywhere I'm glad he's gone, Big Brother creeps me out.
        </>
      );
    }
  }

  if (part === 3) {
    return (
      <>
        Anyway, I'm Ivan 6000. I'm the **BOT** around{" "}
        {Config.general("WORLD_NAME")}. I know everything that goes on around
        here.
      </>
    );
  }

  if (part === 4) {
    return (
      <>
        If you want to know more about any of the channels, type the `/help`
        command in them and I'll tell you about it.
      </>
    );
  }

  if (part === 5) {
    return (
      <>
        But before you explore Beautopia, I need to make sure you're not a spy.
        **Type the `/redpill` command** to join the Degenz army in the fight
        against Big Brother.
      </>
    );
  }

  return <></>;
};

export const AllyOnboardMessageTwo = () => {
  return (
    <>
      Ok, I guess you've proven you want to be part of the Degen army. Go and
      explore {Config.general("WORLD_NAME")}!
    </>
  );
};

export const AllyOnboardMessageThree = ({
  part,
  member,
}: {
  part: 1 | 2 | 3;
  member: GuildMember;
}) => {
  if (part === 1) {
    return (
      <>
        Remember <User id={member.id} />, type the `/help` command at any time
        to find out what you can do in each channel.
      </>
    );
  }

  if (part === 2) {
    return (
      <>And don't forget to check your stats by typing the `/stats` command!</>
    );
  }

  if (part === 3) {
    return <>See you around the city man.</>;
  }

  return <></>;
};

////////////////////////////////////////////////////////////////////////////////
// Big Brother
////////////////////////////////////////////////////////////////////////////////

export const TokenIssuanceAnnouncement = ({ amount }: { amount: number }) => {
  return (
    <>
      {emoji.get("moneybag")} **ATTENTION @everyone **. Big Brother has been
      gracious enough to issue everyone with **`{amount}`{" "}
      {currency({ bold: false })}**. Check your balance by using the `/stats`
      command now. Spend them wisely, won't you.
    </>
  );
};

export const WelcomeMessagePublic = ({ member }: { member: GuildMember }) => (
  <Log event="VERIFY" level="neutral">
    <User id={member.id} /> joined the server. Type the `/obey` command to begin
    your beautiful life in **{Config.general("WORLD_NAME")}**.
  </Log>
);

export const WelcomeMessagePrivate = ({
  member,
  part,
  response,
}: {
  member: GuildMember;
  part: 1 | 2 | 3 | 4;
  response?: string;
}) => {
  if (part === 1) {
    return (
      <>
        Welcome comrade <User id={member.id} /> to **
        {Config.general("WORLD_NAME")}**. Big Brother has been kind enough to
        issue you with your own apartment! Beautiful, isn't it?!
      </>
    );
  }

  if (part === 2) {
    return (
      <>
        Now, **LISTEN UP COMRADE!** While you are in{" "}
        {Config.general("WORLD_NAME")}, you are expected to behave like a **GOOD
        CITIZEN**. Do you understand?
      </>
    );
  }

  if (part === 3) {
    if (response === "yes") {
      return (
        <>
          There's a Good Citizen. Because you're such a good chap, I've issued
          you with 100 {currency()}!
        </>
      );
    } else {
      return (
        <>
          **NO?!**
          <br />
          Well, normally I'd issue 100 {currency()}. But seeing as you and are
          clearly **NOT** a good citizen, I've issued you with 40. Maybe *that*
          will give you something to think about.
        </>
      );
    }
  }

  return (
    <>
      Now, I'm leaving this room so you're free to wallow in your own filth. But
      remember <User id={member.id} />, I'll be keeping an eye on you. Don't let
      me catch you in here with contraband.
    </>
  );
};

export const AllSet = ({
  memberId,
  apartmentId,
}: {
  memberId: GuildMember["id"];
  apartmentId: TextChannel["id"];
}) => (
  <>
    Welcome, Comrade <User id={memberId} /> to **{Config.general("WORLD_NAME")}
    **! Enjoy your beautiful new private apartment -{" "}
    <Channel id={apartmentId} />
  </>
);

////////////////////////////////////////////////////////////////////////////////
// Hall of Privacy
////////////////////////////////////////////////////////////////////////////////

const Log = ({
  event,
  level,
  children,
}: {
  event: keyof Events | "VERIFY";
  level: "neutral" | "negative";
  children: React.ReactNode;
}) => {
  const e = level === "neutral" ? emoji.get("hash") : emoji.get("o2");
  return (
    <>
      {e} `{event}` {children}
    </>
  );
};

export const SuccessfulFundsTransferLog = (props: SuccessfulTransferEvent) => (
  <Log event="TRANSFER" level="neutral">
    <User id={props.sender.id} /> transferred {props.amount} <Currency bold />{" "}
    to <User id={props.recipient!.id} />.
  </Log>
);

export const InsufficentFundsTransferLog = (props: FailedTransferEvent) => (
  <Log event="TRANSFER" level="neutral">
    <User id={props.sender.id} /> tried to transfer {props.amount}{" "}
    <Currency bold /> to <User id={props.recipient!.id} /> but didn't have
    enough tokens! What a **FOOL** HAHA.
  </Log>
);

export const InsufficientFundsTossLog = ({
  challenger,
  amount,
}: Pick<FailedTossEvent, "challenger" | "amount">) => (
  <Log event="TOSS" level="neutral">
    <User id={challenger.id} /> tried to bet {amount} <Currency bold /> tokens,
    but
  </Log>
);

export const SuccessfulTossLog = ({
  challenger,
  challengee,
  amount,
  winner,
}: Pick<
  SuccessfulTossEvent,
  "challenger" | "challengee" | "amount" | "winner"
>) => (
  <Log event="TOSS" level="neutral">
    <User id={challenger.id} /> {winner === "CHALLENGER" ? "won" : "lost"}{" "}
    {amount} <Currency bold /> tossing with <User id={challengee.id} />.
  </Log>
);

export const ImprisonLog = ({ member }: ImprisonEvent) => (
  <Log event="IMPRISON" level="neutral">
    <User id={member.id} /> was imprisoned.
  </Log>
);

export const ReturnLog = ({ member }: ReleaseEvent) => (
  <Log event="RELEASE" level="neutral">
    <User id={member.id} /> was release from prison.
  </Log>
);

export const EnterLog = ({ citizen }: EnterEvent) => {
  return (
    <Log event="ENTER" level="neutral">
      <User id={citizen.id} /> entered the game.
    </Log>
  );
};
