import React from "react";
import { Channel as DiscordChannel, GuildMember } from "discord.js";
import { channelMention, userMention } from "@discordjs/builders";
import emoji from "node-emoji";
import Config from "config";
import { Format } from "lib";

////////////////////////////////////////////////////////////////////////////////
// General
////////////////////////////////////////////////////////////////////////////////

export const User = ({ id }: { id: GuildMember["id"] }) => (
  <>{userMention(id)}</>
);

export const Channel = ({ id }: { id: DiscordChannel["id"] }) => (
  <>{channelMention(id)}</>
);

//////////////////////////////////////////////////////////////////////////////////
//// Tosser Ted
//////////////////////////////////////////////////////////////////////////////////

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
        to a coin flip for {Format.currency(amount)}. But you didn't respond in
        time.
      </>
    );
  }
  return (
    <>
      <User id={challengee.id} /> - <User id={challenger.id} /> has challenged
      you to a coin flip for {Format.currency(amount)}. Do you accept? Or are
      you {emoji.get("chicken")}?
    </>
  );
};

export const TossChoiceTimeoutPrompt = () => (
  <>
    I said I ain't got all day. What, you can't choose heads or tails in less
    than 30 seconds?
  </>
);

export const TossChoicePrompt = () => (
  <>Whats your choice pal, I ain't got all day.. Head or Tails?</>
);

//////////////////////////////////////////////////////////////////////////////////
//// Banker Beatrice
//////////////////////////////////////////////////////////////////////////////////

export const InsufficientFundsTransferReply = ({
  recipient,
  amount,
}: {
  recipient: GuildMember;
  amount: number;
}) => (
  <>
    You don't *have* {Format.currency(amount)} to send to{" "}
    <User id={recipient.id} />, dumb dumb.
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
    Transferred {Format.currency(amount)} to <User id={recipient.id} />. How
    nice of you. {Format.transaction(balance + amount, -amount)}
  </>
);

//////////////////////////////////////////////////////////////////////////////////
//// Hugh Donie
//////////////////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////////////////
//// Walden
//////////////////////////////////////////////////////////////////////////////////

export const SuccessfulBribeReply = ({
  amount,
  citizenId,
}: {
  amount: number;
  citizenId: string;
}) => {
  return (
    <>
      Ok, <User id={citizenId} /> {Format.currency(amount)} will do. The door
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
      I'm insulted, <User id={citizenId} />. You think I can be bought for{" "}
      {Format.currency(amount)}? Just for that, I'll be keeping your{" "}
      {Format.currency(null)} and you **won't** be getting the exit code.
    </>
  );
};

//////////////////////////////////////////////////////////////////////////////////
//// Ivan 6000
//////////////////////////////////////////////////////////////////////////////////

export const FirstActivityReply = ({
  choice,
}: {
  choice: "FIGHT" | "GAMBLE" | "SHOP";
}) => {
  if (choice === "FIGHT") {
    return (
      <>
        If you want to learn to hacker battle, go and see{" "}
        <User id={Config.clientId("SENSEI")} /> in the
        <Channel id={Config.channelId("TRAINING_DOJO")} /> channel. Just press
        the "LFG" button when you get in there.
      </>
    );
  }

  if (choice === "GAMBLE") {
    return (
      <>
        If you want to gamble, go and see{" "}
        <User id={Config.clientId("TOSSER")} /> in{" "}
        <Channel id={Config.channelId("TOSS_HOUSE")} /> channel. Remember to
        type the `/help` command when you get there.
      </>
    );
  }

  if (choice === "SHOP") {
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

//////////////////////////////////////////////////////////////////////////////////
//// Big Brother
//////////////////////////////////////////////////////////////////////////////////

//export const TokenIssuanceAnnouncement = ({ amount }: { amount: number }) => {
//  return (
//    <>
//      {emoji.get("moneybag")} **ATTENTION @everyone **. Big Brother has been
//      gracious enough to issue everyone with **`{amount}`{" "}
//      {currency({ bold: false })}**. Check your balance by using the `/stats`
//      command now. Spend them wisely, won't you.
//    </>
//  );
//};
