import React from "react";
import { CommandInteraction, GuildMember } from "discord.js";
import { CommandController } from "../CommandController";
import { getUser, transferBalance } from "../legacy/db";
import Utils from "../Utils";
import {
  InsufficientFundsTransferReply,
  TransferSuccessfulReply,
  UserMention,
} from "../legacy/templates";
import { userMention } from "@discordjs/builders";
import Events from "../Events";
import Config from "config";

const { r } = Utils;

export default class BankerCommandController extends CommandController {
  async balance(i: CommandInteraction) {
    const user = await getUser(i.user.id);
    if (user === null) return;

    i.reply({
      content: r(
        <>
          {"\u{1f4b0}"} `{user.gbt}`
        </>
      ),
      ephemeral: true,
    });

    Events.emit("BALANCE_CHECKED", { user });
  }

  async transfer(i: CommandInteraction) {
    if (!Config.app("transferEnabled")) {
      i.reply({
        content: Utils.r(
          <>
            <UserMention id={i.user.id} /> - The transfer system is currently
            under review. Check back later.
          </>
        ),
        ephemeral: true,
      });
      return;
    }

    // Get options
    const o = {
      amount: i.options.getInteger("amount", true),
      recipient: i.options.getMember("recipient", true) as GuildMember,
    };

    // Retrieve recipient info from Db
    const [sender, recipient] = await Promise.all([
      await getUser(i.user.id),
      await getUser(o.recipient.id),
    ]);

    // Handle missing recipient
    if (recipient === null) {
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
    await transferBalance(i.user.id, recipient.id, o.amount);

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
    Events.emit("GBT_TRANSFERRED", { sender, recipient, amount: o.amount });
  }
}
