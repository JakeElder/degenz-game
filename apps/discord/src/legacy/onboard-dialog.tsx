import { GuildMember } from "discord.js";
import emoji from "node-emoji";
import React from "react";
import Config from "config";
import { UserMention, ChannelMention } from "./templates";
import { Format } from "lib";
import pluralize from "pluralize";

export const WelcomeComrade = (props: { member: GuildMember }) => (
  <>
    **Welcome**, comrade <UserMention id={props.member.id} />.
  </>
);

export const BBIntro = () => (
  <>I am the **SUPREME LEADER** of **{Config.general("WORLD_NAME")}**.</>
);

export const ApartmentIssuance = (props: { channelId: string }) => (
  <>
    I have issued you with your own apartment,{" "}
    <ChannelMention id={props.channelId} />! *Beautiful*, isn't it?
  </>
);

export const DormAssignment = (props: { channelId: string }) => (
  <>
    This thread - <ChannelMention id={props.channelId} /> is your orientation.
  </>
);

export const UnderstandPrompt = () => (
  <>
    Now, **LISTEN UP COMRADE!** While you're in {Config.general("WORLD_NAME")},
    you are to do as you're told and be a GOOD CITIZEN. **Is that clear?**
  </>
);

export const UnderstandResponse = (props: { response: "YES" | "NO" }) => {
  if (props.response === "YES") {
    return <>There's a good citizen.</>;
  } else {
    return <>**No?..** Very funny.</>;
  }
};

export const MoneyIssuance = (props: { response: "YES" | "NO" }) => {
  if (props.response === "YES") {
    return (
      <>
        Because I am the benevolent leader, I have issued you with{" "}
        {Format.currency(100)}, the currency of {Config.general("WORLD_NAME")}.
      </>
    );
  } else {
    return (
      <>
        Normally I'd issue you {Format.currency(100)}, the currency of{" "}
        {Config.general("WORLD_NAME")}. Because of your poor humour, I'm only
        assigning you {Format.currency(50)} tokens.
      </>
    );
  }
};

export const GoodBadTraining = () => (
  <>
    If you behave like a good citizen, you'll receive {Format.token()} from the
    state when we deem suitable. If however you become *disobedient*, you'll
    quickly find yourself in prison.
  </>
);

export const BBExit = () => (
  <>
    Now, I'm **leaving** this channel, but *remember*.. I'll be keeping an eye
    on you citizen {emoji.get("eye")}.
  </>
);

export const IsHeGone = () => <>Is he gone?</>;

export const ChannelListTraining = (props: {
  response: "YES" | "NO" | "UNSURE";
}) => {
  if (props.response === "YES") {
    return (
      <>
        Right, I can see in the room list he's not in here any more. It's safe
        for us to talk.
      </>
    );
  } else if (props.response === "NO") {
    return (
      <>
        What do you mean no? He's left the room, I can see from the user list.
        It's safe for us to talk now.
      </>
    );
  } else {
    return (
      <>
        You're not sure?.. I can see from the user list he's left the room now
        so it's safe for us to talk.
      </>
    );
  }
};

export const AllyIntro = () => (
  <>
    Anyway, I'm Ivan 6000, the **BOT** around Beautopia. I know everything that
    goes on around here.
  </>
);

export const NarkCheck = () => (
  <>
    But before I take you any further, I need to know you're not one of *them*.
    You know, a spy. Only *then* will you be a member of the **Degenz Army**
  </>
);

export const RedpillPrompt = () => (
  <>**Type the `/redpill` command** to join the **Degenz Army**</>
);

export const InitiationCongrats = () => (
  <>
    Ok! You took the {emoji.get("pill")} **red pill** and completed your first
    **QUEST**, `JOIN_THE_DEGENZ_ARMY`!
  </>
);

export const GBTReward = ({
  initial,
  net,
}: {
  initial: number;
  net: number;
}) => (
  <>
    For completing this quest, You earnt {Format.currency(net)}, the **currency
    of Beautopia**!
  </>
);

export const GBTUsage = () => (
  <>
    {Config.emojiCode("GBT_COIN")} is the . You can use it to buy *real things*
    like NFT's in <ChannelMention id={Config.channelId("MART")} />.
  </>
);

export const StatsPromptPrep = () => (
  <>
    **BUT WAIT..** Before you go, you can type `/stats` any time to check your{" "}
    {Format.currency(null)} balance and strength.
  </>
);

export const StatsPrompt = () => <>**Type `/stats` now** for a bonus.</>;

export const StatsRewardMessage = () => (
  <>**Nice!**.. You got another {Format.currency(10)}.</>
);

export const OneMoreThing = () => <>Ok, one more thing.</>;

export const WorldIntro = () => (
  <>{Config.general("WORLD_NAME")} is vast and can be scary at times.</>
);

export const HelpPrompt = () => (
  <>
    If you ever get stuck in any room, at any time, just type `/help` and I'll
    explain the area to you.
    <br />
    Try it now, **type `/help`**
  </>
);

export const GoExplore = () => (
  <>Alright Degen, go and explore **{Config.general("WORLD_NAME")}**.</>
);

export const RememberHelp = () => (
  <>And remember, if you need info just type `/help` or ask a moderator.</>
);

export const SeeYa = () => <>See you around {Config.general("WORLD_NAME")}!</>;

export const SelfDestructMessage = ({ seconds }: { seconds: number }) => {
  return (
    <>
      **This thread will self destruct in `{seconds}`{" "}
      {pluralize("second", seconds)}!**
    </>
  );
};
