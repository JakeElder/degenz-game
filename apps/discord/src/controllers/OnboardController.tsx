import React from "react";
import Config from "app-config";
import { MessageActionRow } from "discord.js";
import { BigBrotherBot } from "../bots";
import { User } from "../legacy/types";
import { OnboardDialogBB } from "../legacy/onboard-dialog";
import Utils from "../Utils";
import { makeButton } from "../legacy/utils";
import { transactBalance } from "../legacy/db";

const { r } = Utils;

export default class OnboardController {
  static async partOne(user: User, bb: BigBrotherBot) {
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
