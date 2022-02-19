import React from "react";
import { CommandInteraction, GuildMember } from "discord.js";
import { CommandController } from "../CommandController";
import { getUser, transferBalance } from "../legacy/db";
import Utils from "../Utils";
import {
  Balance,
  InsufficientFundsTransferReply,
  TransferSuccessfulReply,
} from "../legacy/templates";
import { userMention } from "@discordjs/builders";

const { r } = Utils;

export default class BankerCommandController extends CommandController {
  async balance(i: CommandInteraction) {
    const user = await getUser(i.user.id);
    if (user === null) return;

    i.reply({
      content: r(<Balance tokens={user.gbt} />),
      ephemeral: true,
    });

    // const member = await this.getMember(i.user.id);

    // const e: BalanceCheckedEvent = {
    //   event: "BALANCE_CHECKED",
    //   data: { member, balance: user.gbt },
    // };

    // this.postBalanceResult(e);
    // this.emit("WORLD_EVENT", e);
  }

  async transfer(i: CommandInteraction) {
    // Get options
    const o = {
      amount: i.options.getInteger("amount", true),
      recipient: i.options.getMember("recipient", true) as GuildMember,
    };

    // Retrieve recipient info from Db
    const [sender, recipient] = await Promise.all([
      (await getUser(i.user.id))!,
      await getUser(o.recipient.id),
    ]);

    // Handle missing recipient
    if (recipient === null) {
      // emit("TRANSFER", {
      //   result: "FAIL",
      //   error: "RECIPIENT_NOT_FOUND",
      //   recipient: o.recipient,
      //   amount: o.amount,
      //   sender: i.guild!.members.cache.get(i.user.id) as GuildMember,
      // });

      await i.reply({
        content: `${userMention(o.recipient.id)}?`,
        ephemeral: true,
      });

      return;
    }

    // Handle zero and negative amounts
    if (o.amount <= 0) {
      await i.reply({ content: `Must be > 0`, ephemeral: true });
      return;
    }

    // Handle insufficient balance
    if (o.amount > sender.gbt) {
      // emit("TRANSFER", {
      //   result: "FAIL",
      //   error: "INSUFFICIENT_BALANCE",
      //   recipient: o.recipient,
      //   amount: o.amount,
      //   sender: i.guild!.members.cache.get(i.user.id) as GuildMember,
      // });

      await i.reply({
        content: r(
          <InsufficientFundsTransferReply
            amount={o.amount}
            recipient={o.recipient}
          />
        ),
        ephemeral: true,
      });

      return;
    }

    // Perform transaction
    await transferBalance(i.user.id, recipient.discordId, o.amount);

    // Reply to interaction
    await i.reply({
      content: r(
        <TransferSuccessfulReply
          amount={o.amount}
          recipient={o.recipient}
          balance={sender.gbt - o.amount}
        />
      ),
      ephemeral: true,
    });

    // const member = await this.getMember(i.user.id);

    // const e: TokenTransferEvent = {
    //   event: "TOKEN_TRANSFER",
    //   data: { member, recipient: o.recipient, amount: o.amount },
    // };

    // this.postTransferResult(e);
    // this.emit("WORLD_EVENT", e);
  }
}
