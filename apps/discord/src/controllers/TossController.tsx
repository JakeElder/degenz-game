import React from "react";
import {
  CommandInteraction,
  GuildMember,
  Message,
  MessageActionRow,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import Config from "app-config";
import { Format } from "lib";
import { TossGame } from "../legacy/types";
import { AdminBot } from "../bots";
import { getUser, transactBalance } from "../legacy/db";
import { calculateTossRake, makeButton } from "../legacy/utils";
import Utils from "../Utils";
import {
  TossChallengeInvitation,
  TossChoicePrompt,
  TossChoiceTimeoutPrompt,
} from "../legacy/templates";
import { userMention } from "@discordjs/builders";

const { r } = Utils;

export default class TossController {
  static async toss(i: CommandInteraction, admin: AdminBot) {
    const g: TossGame = await (async (): Promise<TossGame> => {
      const amount = i.options.getInteger("amount", true);
      const challengeeMember = i.options.getMember(
        "opponent",
        true
      ) as GuildMember;

      const isTed = challengeeMember.user.id === Config.clientId("TOSSER");

      const [challengerMember, challengerUser, challengeeUser] =
        await Promise.all([
          admin.getMember(i.user.id),
          getUser(i.user.id),
          isTed ? Promise.resolve(null) : getUser(challengeeMember.id),
        ]);

      return {
        amount,
        rake: calculateTossRake(amount),
        choice: "UNDECIDED",
        winner: "UNDECIDED",
        result: "UNDECIDED",
        againstHouse: isTed,
        accepted: isTed ? true : null,
        member: challengerMember,
        challenger: {
          user: challengerUser,
          member: challengerMember,
          balanceAvailable: challengerUser!.gbt >= amount,
        },
        challengee: {
          user: challengeeUser,
          member: challengeeMember,
          balanceAvailable: isTed ? true : challengeeUser!.gbt >= amount,
        },
      };
    })();

    // Handle insufficient balance
    if (!g.challenger.balanceAvailable || !g.challengee.balanceAvailable) {
      await i.reply(
        !g.challenger.balanceAvailable
          ? `You don't have ${g.amount} to bet.`
          : `**${g.challengee.member.displayName}** doesn't have ${g.amount} to gamble with. \u{1f62d} \u{1f602}`
      );
      return {
        success: false,
        error: "INSUFFICIENT_BALANCE_INIT",
        data: { game: g },
      };
    }

    // Reply with heads/tails choice
    const choiceMessage = (await i.reply({
      content: r(<TossChoicePrompt />),
      fetchReply: true,
      components: [
        new MessageActionRow().addComponents(
          makeButton("heads"),
          makeButton("tails")
        ),
      ],
      ephemeral: true,
    })) as Message;

    // Wait for choice
    try {
      const res = await choiceMessage.awaitMessageComponent({
        dispose: true,
        componentType: "BUTTON",
        time: 30 * 1000,
      });
      g.choice = res.customId === "heads" ? "HEADS" : "TAILS";
      await i.editReply({
        content: r(<TossChoicePrompt />),
        components: [
          new MessageActionRow().addComponents(
            makeButton("heads", {
              disabled: true,
              selected: g.choice === "HEADS",
            }),
            makeButton("tails", {
              disabled: true,
              selected: g.choice === "TAILS",
            })
          ),
        ],
      });
      await res.update({ fetchReply: false });
    } catch (e) {
      console.error(e);
      await i.editReply({
        content: r(<TossChoiceTimeoutPrompt />),
        components: [
          new MessageActionRow().addComponents(
            makeButton("heads", { disabled: true, selected: false }),
            makeButton("tails", { disabled: true, selected: false })
          ),
        ],
      });
      return {
        success: false,
        error: "SELECT_SIDE_TIMEOUT",
        data: { game: g },
      };
    }

    g.challenger.user = await getUser(g.challenger.user!.discordId);

    if (g.challenger.user!.gbt < g.amount) {
      g.challenger.balanceAvailable = false;
      i.followUp({
        content: `You don't have ${g.amount} to bet.`,
        ephemeral: true,
      });
      return {
        success: false,
        error: "INSUFFICIENT_BALANCE_CHOICE",
        data: { game: g },
      };
    }

    if (g.againstHouse) {
      g.result = Math.random() < 0.5 ? "HEADS" : "TAILS";
      g.winner = g.result === g.choice ? "CHALLENGER" : "CHALLENGEE";

      await transactBalance(
        g.challenger.user!.discordId,
        g.winner === "CHALLENGER" ? g.amount - g.rake : -g.amount
      );

      g.challenger.user = await getUser(g.challenger.user!.discordId);
      await i.followUp({
        embeds: [
          TossController.makeTossResultEmbed({ g, player: "CHALLENGER" }),
        ],
        ephemeral: true,
      });

      // this.emit("WORLD_EVENT", { event: "TOSS_COMPLETED", data: g });
      return { success: true, data: { game: g } };
    }

    // Handle bets agains other players

    const apt = await admin.getTextChannel(
      g.challengee.user!.primaryTenancy.discordChannelId
    );
    await apt.permissionOverwrites.create(Config.roleId("TOSSER_BOT"), {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
      EMBED_LINKS: true,
    });

    const tedApt = (await i.client.channels.fetch(
      g.challengee.user!.primaryTenancy.discordChannelId
    )) as TextChannel;

    const [challengeMessage] = await Promise.all([
      tedApt.send({
        content: r(
          <TossChallengeInvitation
            challenger={g.challenger.member}
            challengee={g.challengee.member}
            amount={g.amount}
          />
        ),
        components: [
          new MessageActionRow().addComponents(
            makeButton("accept"),
            makeButton("chicken")
          ),
        ],
      }),
      i.followUp({
        content:
          "Alright, I'll send them that challenge. Wait 30 seconds at most man.",
        ephemeral: true,
      }),
    ]);

    try {
      const acceptedResponse = await challengeMessage.awaitMessageComponent({
        filter: (b) => b.user.id === g.challengee.member.id,
        componentType: "BUTTON",
        time: 30 * 1000,
      });
      g.accepted = acceptedResponse.customId === "accept" ? true : false;

      await challengeMessage.edit({
        content: r(
          <TossChallengeInvitation
            challenger={g.challenger.member}
            challengee={g.challengee.member}
            amount={g.amount}
          />
        ),
        components: [
          new MessageActionRow().addComponents(
            makeButton("accept", { disabled: true, selected: g.accepted }),
            makeButton("chicken", { disabled: true, selected: !g.accepted })
          ),
        ],
      });
      await acceptedResponse.update({ fetchReply: false });

      if (!g.accepted) {
        challengeMessage.reply("You chickened out!");
      }
    } catch (e) {
      await challengeMessage.edit({
        content: r(
          <TossChallengeInvitation
            timeout={true}
            challenger={g.challenger.member}
            challengee={g.challengee.member}
            amount={g.amount}
          />
        ),
        components: [
          new MessageActionRow().addComponents(
            makeButton("accept", { disabled: true, selected: false }),
            makeButton("chicken", { disabled: true, selected: false })
          ),
        ],
      });
      await i.followUp({
        content: "They didn't accept in time.",
        ephemeral: true,
      });
      return {
        success: false,
        error: "CHALLENGE_ACCEPT_TIMEOUT",
        data: { game: g },
      };
    }

    if (!g.accepted) {
      await i.followUp(`They chickened out! \u{1f602}`);

      return {
        success: false,
        error: "CHALLENGE_NOT_ACCEPTED",
        data: { game: g },
      };
    }

    [g.challengee.user, g.challenger.user] = await Promise.all([
      getUser(g.challengee.user!.discordId),
      getUser(g.challenger.user!.discordId),
    ]);

    // Handle insufficient balance
    g.challenger.balanceAvailable = g.challenger.user!.gbt >= g.amount;
    g.challengee.balanceAvailable = g.challengee.user!.gbt >= g.amount;

    if (!g.challenger.balanceAvailable || !g.challengee.balanceAvailable) {
      await i.reply(
        !g.challenger.balanceAvailable
          ? `You don't have ${g.amount} to bet.`
          : `**${g.challengee.member.displayName}** doesn't have ${g.amount} to gamble with. \u{1f62d} \u{1f602}`
      );
      return {
        success: false,
        error: "INSUFFICIENT_BALANCE_INIT",
        data: { game: g },
      };
    }

    g.result = Math.random() < 0.5 ? "HEADS" : "TAILS";
    g.winner = g.result === g.choice ? "CHALLENGER" : "CHALLENGEE";

    // Update balances
    await Promise.all([
      transactBalance(
        g.challenger.user!.discordId,
        g.winner === "CHALLENGER" ? g.amount - g.rake : -g.amount
      ),
      transactBalance(
        g.challengee.user!.discordId,
        g.winner === "CHALLENGEE" ? g.amount - g.rake : -g.amount
      ),
    ]);

    [g.challengee.user, g.challenger.user] = await Promise.all([
      getUser(g.challengee.user!.discordId),
      getUser(g.challenger.user!.discordId),
    ]);

    Promise.all([
      i.followUp({
        embeds: [
          TossController.makeTossResultEmbed({ g, player: "CHALLENGER" }),
        ],
      }),
      challengeMessage.reply({
        embeds: [
          TossController.makeTossResultEmbed({ g, player: "CHALLENGEE" }),
        ],
      }),
    ]);

    // this.emit("WORLD_EVENT", { event: "TOSS_COMPLETED", data: g });
    return { success: true, data: { game: g } };
  }

  static makeTossResultEmbed({
    g,
    player,
  }: {
    g: TossGame;
    player: "CHALLENGER" | "CHALLENGEE";
  }) {
    const win = g.winner === player;
    const p = g[player === "CHALLENGER" ? "challenger" : "challengee"];

    const gifs = {
      TAILS: {
        lose: "https://s10.gifyu.com/images/tails-coin-static---lose.gif",
        win: "https://s10.gifyu.com/images/tails-coin-static.gif",
      },
      HEADS: {
        lose: "https://s10.gifyu.com/images/heads-coin-smaller-static-lose.gif",
        win: "https://s10.gifyu.com/images/heads-coin-smaller-static-win.gif",
      },
    };

    const result = g.result as Exclude<TossGame["result"], "UNDECIDED">;

    const embed = new MessageEmbed()
      .setAuthor({
        name: p.member.displayName,
        iconURL: p.member.displayAvatarURL(),
      })
      .setTitle("Toss Results")
      .setDescription(
        `It was **${g.result}**! You ${
          win
            ? `**WON** \`${g.amount}\` ${Format.currency({
                long: false,
              })} \u{1f389} `
            : `**LOST** \`${g.amount}\` ${Format.currency({
                long: false,
              })} \u{1f62d}`
        }`
      )
      .setColor(win ? "GREEN" : "RED")
      .addField("Challenger", userMention(g.challenger.member.id))
      .addField("Challengee", userMention(g.challengee.member.id))
      .addField("Bet", `${g.amount}`, true)
      .addField("Rake", `${g.rake}`, true)
      .setImage(gifs[result][win ? "win" : "lose"]);

    const net = win ? g.amount - g.rake : -g.amount;
    const before = p.user!.gbt - net;

    if (win) {
      embed.addField("Return", `${g.amount + net}`, true);
    }

    embed.addField(
      `New ${Format.currency({ plural: false })} Balance`,
      `\`${before}\` => \u{1f4b0} \`${p.user!.gbt}\` (${
        win ? `+${g.amount - g.rake}` : `-${g.amount}`
      }) `
    );

    return embed;
  }
}
