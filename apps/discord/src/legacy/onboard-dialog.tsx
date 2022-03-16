import { GuildMember } from "discord.js";
import emoji from "node-emoji";
import React from "react";
import Config from "config";
import { User, Channel } from "./templates";
import { currency } from "./utils";

export const OnboardDialogBB = ({
  part,
  member,
  response,
  channelId,
  type = "APARTMENT",
}: {
  part: number;
  member: GuildMember;
  response?: "yes" | "no";
  channelId?: string;
  type?: "APARTMENT" | "DORMITORY";
}) => {
  switch (part) {
    case 1:
      return (
        <>
          **Welcome**, comrade <User id={member.id} />.
        </>
      );
    case 2:
      return (
        <>I am the **SUPREME LEADER** of **{Config.general("WORLD_NAME")}**.</>
      );
    case 3:
      if (type === "APARTMENT") {
        return (
          <>
            I have issued you with your own apartment,{" "}
            <Channel id={channelId!} />! *Beautiful*, isn't it?
          </>
        );
      } else {
        return (
          <>
            This channel, <Channel id={channelId!} /> is your own personal
            space, where you will receive game notifications. Cosy, isn't it?
          </>
        );
      }
    case 4:
      return (
        <>
          Now, **LISTEN UP COMRADE!** While you're in{" "}
          {Config.general("WORLD_NAME")}, you are to do as you're told and be a
          GOOD CITIZEN. **Is that clear?**
        </>
      );
    case 5:
      if (response === "yes") {
        return <>There's a good citizen.</>;
      } else {
        return <>**No?..** Very funny.</>;
      }
    case 6:
      if (response === "yes") {
        return (
          <>
            Because I am the benevloent leader, I have issued you with{" "}
            {emoji.get("moneybag")}**100** {currency()}, the currency of{" "}
            {Config.general("WORLD_NAME")}.
          </>
        );
      } else {
        return (
          <>
            Normally I'd issue you 100 {emoji.get("moneybag")} {currency()}, the
            currency of {Config.general("WORLD_NAME")}. Because of your poor
            humour, I'm only assigning you **50** tokens.
          </>
        );
      }
    case 7:
      return (
        <>
          If you behave like a good citizen, you'll receive{" "}
          {currency({ long: false, bold: true })} from the state when we deem
          suitable. If however you become *disobedient*, you'll quickly find
          yourself in prison.
        </>
      );
    case 8:
      return (
        <>
          Now, I'm leaving your private apartment, but *remember*.. I'll be
          keeping an eye on you {emoji.get("eye")}.
        </>
      );
  }

  return null;
};

export const OnboardDialogAlly = ({
  part,
  member,
  response,
}: {
  part: number;
  member: GuildMember;
  response?: "yes" | "no" | "unsure";
}) => {
  switch (part) {
    case 1:
      return <>Is he gone?</>;
    case 2:
      if (response === "yes") {
        return (
          <>
            Right, I can see in the room list he's not in here any more. It's
            safe for us to talk.
          </>
        );
      } else if (response === "no") {
        return (
          <>
            What do you mean no? He's left the room, I can see from the user
            list. It's safe for us to talk now.
          </>
        );
      } else {
        return (
          <>
            You're not sure?.. I can see from the user list he's left the room
            now so it's safe for us to talk.
          </>
        );
      }
    case 3:
      return (
        <>
          Anyway, I'm Ivan 6000, the **BOT** around Beautopia. I know everything
          that goes on around here.
        </>
      );
    case 4:
      return (
        <>
          But before I take you any further, I need to know you're not one of
          *them*. You know, a spy. Only *then* will you be a member of the
          **Degenz Army**
        </>
      );
    case 5:
      return <>**Type the `/redpill` command** to join the **Degenz Army**</>;
    case 6:
      return (
        <>
          Ok! You're now part of the **Degenz Army Resistance**! The{" "}
          {emoji.get("pill")} **red pill** you just took will give you access to
          many hidden places in **{Config.general("WORLD_NAME")}**.
        </>
      );
    case 7:
      return (
        <>
          **BUT WAIT..** Before you go, you can type `/stats` any time to check
          your
          {emoji.get("moneybag")}
          {currency({ long: false })} balance and strength.
        </>
      );
    case 8:
      return <>**Type `/stats` now** for a bonus.</>;
    case 9:
      return (
        <>
          **Nice!**.. You got another **{emoji.get("moneybag")}10
          {currency({ long: false, bold: false })}**.
        </>
      );
    case 10:
      return <>Ok, one more thing.</>;
    case 11:
      return (
        <>{Config.general("WORLD_NAME")} is vast and can be scary at times.</>
      );
    case 12:
      return (
        <>
          If you ever get stuck in any room, at any time, just type `/help` and
          I'll explain the area to you.
        </>
      );
    case 13:
      return <>Try it now, **type `/help`**</>;
    case 14:
      return (
        <>Alright Degen, go and explore **{Config.general("WORLD_NAME")}**.</>
      );
    case 15:
      return (
        <>
          And remember, if you need info just type `/help` or ask a moderator.
        </>
      );
    case 16:
      return <>See you around {Config.general("WORLD_NAME")}!</>;
  }

  return null;
};
