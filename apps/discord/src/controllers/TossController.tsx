import React from "react";
import {
  CommandInteraction,
  GuildMember,
  Message,
  MessageActionRow,
  MessageEmbedOptions,
} from "discord.js";
import Config from "config";
import { Format } from "lib";
import { TossGame } from "data/types";
import { AdminBot } from "../bots";
import { getUser, transactBalance } from "../legacy/db";
import { calculateTossRake, makeButton } from "../legacy/utils";
import Utils from "../Utils";
import {
  TossChallengeInvitation,
  TossChoicePrompt,
  TossChoiceTimeoutPrompt,
} from "../legacy/templates";
import Events from "../Events";
import ResidenceController from "./ResidenceController";
import { NPC } from "data/db";
import { userMention } from "@discordjs/builders";
import AchievementController from "./AchievementController";

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
        member: challengerMember!,
        challenger: {
          user: challengerUser,
          member: challengerMember!,
          balanceAvailable: challengerUser!.gbt >= amount,
        },
        challengee: {
          user: challengeeUser,
          member: challengeeMember,
          balanceAvailable: isTed ? true : challengeeUser!.gbt >= amount,
        },
      };
    })();

    const bb = await NPC.findOneOrFail({ where: { id: "BIG_BROTHER" } });

    // Handle negative amount
    if (g.amount < 0) {
      await i.reply({
        content: `${bb.emoji} **MINUS** ${Math.abs(
          g.amount
        )}? BIG BROTHER HAS BEEN NOTIFIED. CHEATERS WILL NOT BE TOLERATED.`,
        ephemeral: true,
      });
      return {
        success: false,
        error: "NEGATIVE_AMOUNT",
        data: { game: g },
      };
    }

    // Handle 0
    if (g.amount === 0) {
      await i.reply({
        content: `You want to toss *nothing*? **You can do that anywhere**. Don't come around here with your nothing tosses.`,
        ephemeral: true,
      });
      return {
        success: false,
        error: "ZERO_AMOUNT",
        data: { game: g },
      };
    }

    // Handle insufficient balance
    if (!g.challenger.balanceAvailable || !g.challengee.balanceAvailable) {
      await i.reply({
        content: !g.challenger.balanceAvailable
          ? `You don't have ${g.amount} to bet.`
          : `**${g.challengee.member.displayName}** doesn't have ${g.amount} to gamble with. \u{1f62d} \u{1f602}`,
        ephemeral: true,
      });
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

    g.challenger.user = await getUser(g.challenger.user!.id);

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
        g.challenger.user!.id,
        g.winner === "CHALLENGER" ? g.amount - g.rake : -g.amount
      );

      g.challenger.user = await getUser(g.challenger.user!.id);
      await i.followUp({
        embeds: TossController.makeTossResultEmbeds({ g }),
        ephemeral: true,
      });

      Events.emit("TOSS_COMPLETED", {
        challenger: g.challenger.user,
        challengee: "HOUSE",
        game: g,
      });

      AchievementController.checkAndAward(
        g.challenger.user,
        "TOSS_WITH_TED_QUEST_COMPLETED"
      );

      return { success: true, data: { game: g } };
    }

    // Handle bets against other players
    await (async () => {
      const residence = await ResidenceController.get(g.challengee.user!);
      await ResidenceController.add(residence, Config.clientId("TOSSER"));
    })();

    const residence = await ResidenceController.get(
      g.challengee.user!,
      "TOSSER"
    );

    const [challengeMessage] = await Promise.all([
      residence.send({
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
        challengeMessage.reply({ content: "You chickened out!" });
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
      getUser(g.challengee.user!.id),
      getUser(g.challenger.user!.id),
    ]);

    // Handle insufficient balance
    g.challenger.balanceAvailable = g.challenger.user!.gbt >= g.amount;
    g.challengee.balanceAvailable = g.challengee.user!.gbt >= g.amount;

    if (!g.challenger.balanceAvailable || !g.challengee.balanceAvailable) {
      await i.reply({
        content: !g.challenger.balanceAvailable
          ? `You don't have ${g.amount} to bet.`
          : `**${g.challengee.member.displayName}** doesn't have ${g.amount} to gamble with. \u{1f62d} \u{1f602}`,
        ephemeral: true,
      });
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
        g.challenger.user!.id,
        g.winner === "CHALLENGER" ? g.amount - g.rake : -g.amount
      ),
      transactBalance(
        g.challengee.user!.id,
        g.winner === "CHALLENGEE" ? g.amount - g.rake : -g.amount
      ),
    ]);

    [g.challengee.user, g.challenger.user] = await Promise.all([
      getUser(g.challengee.user!.id),
      getUser(g.challenger.user!.id),
    ]);

    await Promise.all([
      i.followUp({
        embeds: TossController.makeTossResultEmbeds({ g }),
      }),
      challengeMessage.reply({
        embeds: TossController.makeTossResultEmbeds({ g }),
      }),
    ]);

    Events.emit("TOSS_COMPLETED", {
      challenger: g.challenger.user,
      challengee: g.challengee.user,
      game: g,
    });

    AchievementController.checkAndAward(
      g.challenger.user,
      "TOSS_WITH_TED_QUEST_COMPLETED"
    );

    (async () => {
      const residence = await ResidenceController.get(g.challengee.user!);
      await ResidenceController.remove(residence, Config.clientId("TOSSER"));
    })();

    return { success: true, data: { game: g } };
  }

  static makeTossResultEmbeds({ g }: { g: TossGame }): MessageEmbedOptions[] {
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

    const challengerWonLost =
      g.result === g.choice
        ? `**WON** ${Format.currency(g.amount)} \u{1f389} `
        : `**LOST** ${Format.currency(g.amount)} \u{1f62d}`;

    let challengerNet =
      g.winner === "CHALLENGER" ? g.amount - g.rake : -g.amount;
    let challengerBefore = g.challenger.user!.gbt - challengerNet;

    const embeds: MessageEmbedOptions[] = [
      {
        title: "Toss Results",
        thumbnail: { url: gifs[result]["win"] },
        description: `It was **${g.result}**! ${
          g.challenger.user!.mention
        } ${challengerWonLost}`,
        fields: [
          { name: "Challengee", value: userMention(g.challengee.member.id) },
        ],
      },
      {
        author: {
          name: g.challenger.member.displayName,
          icon_url: g.challenger.member.displayAvatarURL(),
        },
        description: Format.transaction(challengerBefore, challengerNet),
        color: g.choice === g.result ? "DARK_GREEN" : "DARK_RED",
      },
    ];

    if (!g.againstHouse) {
      let challengeeNet =
        g.winner === "CHALLENGEE" ? g.amount - g.rake : -g.amount;
      let challengeeBefore = g.challengee.user!.gbt - challengeeNet;
      embeds.push({
        author: {
          name: g.challengee.member.displayName,
          icon_url: g.challengee.member.displayAvatarURL(),
        },
        description: Format.transaction(challengeeBefore, challengeeNet),
        color: g.choice !== g.result ? "DARK_GREEN" : "DARK_RED",
      });
    }

    return embeds;
  }
}
