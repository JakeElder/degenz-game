import { CommandInteraction } from "discord.js";
import React from "react";
import { CommandController } from "../CommandController";
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
          <SuccessfulBribeReply amount={amount} citizenId={user.id} />
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
}
