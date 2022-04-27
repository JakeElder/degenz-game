import { CommandInteraction, GuildMember } from "discord.js";
import React from "react";
import { CommandController } from "../CommandController";
import UserController from "../controllers/UserController";
import { getUser, transactBalance } from "../legacy/db";
import { FailedBribeReply, SuccessfulBribeReply } from "../legacy/templates";
import Utils from "../Utils";

const { r } = Utils;

export default class PrisonerCommandController extends CommandController {
  async bribe(i: CommandInteraction) {
    const user = await getUser(i.user.id);
    if (user === null) return;

    const amount = i.options.getInteger("amount", true);

    await transactBalance(user.id, -amount);

    if (amount >= 30) {
      i.reply({
        content: r(
          <SuccessfulBribeReply
            amount={amount}
            citizenId={user.id}
            releaseCode={user.imprisonment.releaseCode}
          />
        ),
        ephemeral: true,
      });
    } else {
      i.reply({
        content: r(<FailedBribeReply amount={amount} citizenId={user.id} />),
        ephemeral: true,
      });
    }
  }

  async imprison(i: CommandInteraction) {
    const member = i.options.getMember("member", true) as GuildMember;
    const reason = i.options.getString("reason", true);

    const [_, res] = await Promise.all([
      i.deferReply({ ephemeral: true }),
      UserController.imprison(i.user.id, member.id, reason),
    ]);

    await this.respond(i, res.code, res.success ? "SUCCESS" : "FAIL");
  }
  async release(i: CommandInteraction) {
    const member = i.options.getMember("member", true) as GuildMember;

    const [_, res] = await Promise.all([
      i.deferReply({ ephemeral: true }),
      UserController.release(member.id, i.user.id, "RELEASE"),
    ]);

    await this.respond(i, res.code, res.success ? "SUCCESS" : "FAIL");
  }

  async respond(
    i: CommandInteraction,
    content: string,
    type: "SUCCESS" | "FAIL" | "NEUTRAL" = "NEUTRAL"
  ) {
    const prefix = {
      SUCCESS: "\u2705 ",
      FAIL: "\u26a0\ufe0f ",
      NEUTRAL: "",
    }[type];

    content = `${prefix}\`${content}\``;

    await (i.deferred || i.replied
      ? i.editReply({ content })
      : i.reply({ content, ephemeral: true }));
    return;
  }
}
