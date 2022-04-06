import React from "react";
import { Channel as DiscordChannel, GuildMember } from "discord.js";
import { channelMention, userMention } from "@discordjs/builders";
import emoji from "node-emoji";
import { Format } from "lib";

////////////////////////////////////////////////////////////////////////////////
// General
////////////////////////////////////////////////////////////////////////////////

export const UserMention = ({ id }: { id: GuildMember["id"] }) => (
  <>{userMention(id)}</>
);

export const ChannelMention = ({ id }: { id: DiscordChannel["id"] }) => (
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
        <UserMention id={challengee.id} /> - <UserMention id={challenger.id} />{" "}
        challenged you to a coin flip for {Format.currency(amount)}. But you
        didn't respond in time.
      </>
    );
  }
  return (
    <>
      <UserMention id={challengee.id} /> - <UserMention id={challenger.id} />{" "}
      has challenged you to a coin flip for {Format.currency(amount)}. Do you
      accept? Or are you {emoji.get("chicken")}?
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
    <UserMention id={recipient.id} />, dumb dumb.
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
    Transferred {Format.currency(amount)} to <UserMention id={recipient.id} />.
    How nice of you. {Format.transaction(balance + amount, -amount)}
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
  releaseCode,
}: {
  amount: number;
  citizenId: string;
  releaseCode: string;
}) => {
  return (
    <>
      Ok, <UserMention id={citizenId} /> {Format.currency(amount)} will do. The
      door code is `{releaseCode}`. I'm sure you'll be back, degenerate.
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
      I'm insulted, <UserMention id={citizenId} />. You think I can be bought
      for {Format.currency(amount)}? Just for that, I'll be keeping your{" "}
      {Format.currency(null)} and you **won't** be getting the exit code.
    </>
  );
};
