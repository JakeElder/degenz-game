import React from "react";
import Config from "app-config";
import { MessageActionRow, MessageEmbed } from "discord.js";
import { BigBrotherBot, AllyBot, AdminBot } from "../bots";
import { Achievement, User } from "../legacy/types";
import { OnboardDialogAlly, OnboardDialogBB } from "../legacy/onboard-dialog";
import Utils from "../Utils";
import { makeButton } from "../legacy/utils";
import { transactBalance } from "../legacy/db";
import AchievementController from "./AchievementController";
import UserController from "./UserController";
import { FirstActivityReply } from "../legacy/templates";

const { r } = Utils;

export default class OnboardController {
  static async partOne(user: User, bb: BigBrotherBot, ally: AllyBot) {
    const apartment = await bb.getTextChannel(user.tenancies![0].propertyId);
    const member = await bb.getMember(user.id);

    await apartment.send(r(<OnboardDialogBB part={1} member={member} />));
    await Utils.delay(2500);

    await apartment.send(r(<OnboardDialogBB part={2} member={member} />));
    await Utils.delay(3000);

    await apartment.send(
      r(<OnboardDialogBB part={3} member={member} apartmentId={apartment.id} />)
    );
    await Utils.delay(3500);

    const m = await apartment.send({
      content: r(<OnboardDialogBB part={4} member={member} />),
      components: [
        new MessageActionRow().addComponents(
          makeButton("yes"),
          makeButton("no")
        ),
      ],
    });

    const i = await m.awaitMessageComponent({ componentType: "BUTTON" });

    await m.edit({
      content: r(<OnboardDialogBB part={4} member={member} />),
      components: [
        new MessageActionRow().addComponents(
          makeButton("yes", {
            disabled: true,
            selected: i.customId === "yes",
          }),
          makeButton("no", {
            disabled: true,
            selected: i.customId === "no",
          })
        ),
      ],
    });

    await Promise.all([
      i.update({ fetchReply: false }),
      transactBalance(member.id, i.customId === "yes" ? 100 : 40),
    ]);

    await apartment.send({
      content: r(
        <OnboardDialogBB
          member={member}
          part={5}
          response={i.customId as "yes" | "no"}
        />
      ),
    });

    await Utils.delay(2500);
    await apartment.send({
      content: r(
        <OnboardDialogBB
          part={6}
          member={member}
          response={i.customId as "yes" | "no"}
        />
      ),
    });

    await Utils.delay(3000);
    await apartment.send({
      content: r(<OnboardDialogBB part={7} member={member} />),
    });

    await Utils.delay(4000);
    await apartment.send({
      content: r(<OnboardDialogBB part={8} member={member} />),
    });

    await Utils.delay(1000);

    await OnboardController.switchOnboardNPCs(user);

    await Utils.delay(1000);

    await this.partTwo(user, ally);
  }

  static async partTwo(user: User, ally: AllyBot) {
    const apartment = await ally.getTextChannel(user.tenancies![0].propertyId);
    const member = await ally.getMember(user.id);

    const m = await apartment.send({
      content: r(<OnboardDialogAlly part={1} member={member} />),
      components: [
        new MessageActionRow().addComponents(
          makeButton("yes"),
          makeButton("no"),
          makeButton(
            "unsure",
            undefined,
            "\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af"
          )
        ),
      ],
    });

    const i = await m.awaitMessageComponent({ componentType: "BUTTON" });

    await m.edit({
      content: r(<OnboardDialogAlly part={1} member={member} />),
      components: [
        new MessageActionRow().addComponents(
          makeButton("yes", {
            disabled: true,
            selected: i.customId === "yes",
          }),
          makeButton("no", {
            disabled: true,
            selected: i.customId === "no",
          }),
          makeButton(
            "unsure",
            {
              disabled: true,
              selected: i.customId === "unsure",
            },
            "\u00af\u005c\u005f\u0028\u30c4\u0029\u005f\u002f\u00af"
          )
        ),
      ],
    });
    i.update({ fetchReply: false });

    await apartment.send(
      r(
        <OnboardDialogAlly
          part={2}
          member={member}
          response={i.customId as "yes" | "no" | "unsure"}
        />
      )
    );
    await Utils.delay(3000);

    await apartment.send(r(<OnboardDialogAlly member={member} part={3} />));
    await Utils.delay(4000);

    await apartment.send({
      content: r(<OnboardDialogAlly member={member} part={4} />),
      embeds: [
        new MessageEmbed().setImage(
          "https://s10.gifyu.com/images/red-pill.gif"
        ),
      ],
    });
    await Utils.delay(1000);

    await apartment.send(r(<OnboardDialogAlly member={member} part={5} />));
  }

  static async partThree(user: User, admin: AdminBot, ally: AllyBot) {
    await AchievementController.award(
      user!,
      Achievement.JOINED_THE_DEGENZ,
      admin
    );

    await UserController.openWorld(user!, admin);

    await Utils.delay(3000);

    const apartment = await ally.getTextChannel(user.tenancies![0].propertyId);
    const member = await ally.getMember(user.id);

    await apartment.send(r(<OnboardDialogAlly member={member} part={6} />));
    await Utils.delay(3000);

    await apartment.send(r(<OnboardDialogAlly member={member} part={7} />));
    await Utils.delay(2500);

    await apartment.send(r(<OnboardDialogAlly member={member} part={8} />));
  }

  static async partFour(user: User, admin: AdminBot, ally: AllyBot) {
    const apartment = await ally.getTextChannel(user.tenancies![0].propertyId);
    const member = await ally.getMember(user.id);

    await apartment.send(r(<OnboardDialogAlly member={member} part={9} />));
    await Utils.delay(2000);

    await AchievementController.award(user!, Achievement.STATS_CHECKED, admin);

    await Utils.delay(3000);

    await apartment.send(r(<OnboardDialogAlly member={member} part={10} />));
    await Utils.delay(2000);

    await apartment.send(r(<OnboardDialogAlly member={member} part={11} />));
    await Utils.delay(2500);

    await apartment.send(r(<OnboardDialogAlly member={member} part={12} />));
    await Utils.delay(3000);

    await apartment.send(r(<OnboardDialogAlly member={member} part={13} />));
  }

  static async partFive(user: User, admin: AdminBot, ally: AllyBot) {
    const apartment = await ally.getTextChannel(user.tenancies![0].propertyId);
    const member = await ally.getMember(user.id);

    await Utils.delay(2000);

    await AchievementController.award(user!, Achievement.HELP_REQUESTED, admin);
    await Utils.delay(2000);

    await apartment.send(r(<OnboardDialogAlly member={member} part={14} />));
    await Utils.delay(2000);

    await OnboardController.sendNextPrompt(user, ally);
    await Utils.delay(3000);

    await apartment.send(r(<OnboardDialogAlly member={member} part={15} />));
    await Utils.delay(2500);

    await apartment.send(r(<OnboardDialogAlly member={member} part={16} />));
  }

  static async sendNextPrompt(user: User, ally: AllyBot) {
    const apartment = await ally.getTextChannel(user.tenancies![0].propertyId);

    const m = await apartment.send({
      content:
        "There's lots to see and do here, so what do you feel like doing?",
      components: [
        new MessageActionRow().addComponents(
          makeButton("fight"),
          makeButton("gamble"),
          makeButton("shop")
        ),
      ],
    });

    const i = await m.awaitMessageComponent({ componentType: "BUTTON" });

    await m.edit({
      content: "So what are you gonna do now you're a Degen?",
      components: [
        new MessageActionRow().addComponents(
          makeButton("fight", {
            disabled: true,
            selected: i.customId === "fight",
          }),
          makeButton("gamble", {
            disabled: true,
            selected: i.customId === "gamble",
          }),
          makeButton("shop", {
            disabled: true,
            selected: i.customId === "shop",
          })
        ),
      ],
    });
    i.update({ fetchReply: false });

    // this.emit("WORLD_EVENT", {
    //   event: "FIRST_WORLD_CHOICE",
    //   data: { member, choice },
    // });

    await apartment.send(r(<FirstActivityReply choice={i.customId} />));
  }

  static async switchOnboardNPCs(user: User) {
    const admin = Utils.su();
    const apartment = await admin.getTextChannel(user.tenancies![0].propertyId);

    await apartment.permissionOverwrites.delete(
      Config.roleId("BIG_BROTHER_BOT")
    );

    await Utils.delay(2000);

    await apartment.permissionOverwrites.create(Config.roleId("ALLY_BOT"), {
      VIEW_CHANNEL: true,
      EMBED_LINKS: true,
    });
  }
}
