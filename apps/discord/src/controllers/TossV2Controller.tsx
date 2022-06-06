import React from "react";
import { User, Toss } from "data/db";
import {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  InteractionUpdateOptions,
  MessageActionRow,
  MessageButton,
  MessageButtonStyleResolvable,
  MessageOptions,
} from "discord.js";
import { Global } from "../Global";
import { ChannelMention, UserMention } from "../legacy/templates";
import Utils from "../Utils";
import Config from "config";
import { Format } from "lib";
import { calculateTossRake } from "../legacy/utils";
import { Routes } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";

type Contender = {
  user: User;
  member: GuildMember;
};

type OpponentCommit = {
  type: "OPPONENT";
  data: {
    winner: "CHALLENGER" | "CHALLENGEE";
    yld: {
      challenger: number;
      challengee: number;
    };
  };
};

type SelfCommit = {
  type: "SELF";
  data: {
    yld: number;
  };
};

type Commit = OpponentCommit | SelfCommit;

export default class TossV2Controller {
  static rest: REST;

  static async init() {
    this.rest = new REST({ version: "10", rejectOnRateLimit: ["/"] }).setToken(
      Config.botToken("TOSSER")
    );
    await this.bindEventListeners();
  }

  static async bindEventListeners() {
    const tosser = Global.bot("TOSSER");

    tosser.client.on("interactionCreate", async (i) => {
      if (!i.isButton()) {
        return;
      }

      const [type, action, tossId] = i.customId.split(":") as [
        string,
        (
          | "SIDE_SELECT_HEADS"
          | "SIDE_SELECT_TAILS"
          | "OPEN_CHALLENGE_RESPONSE_ACCEPT"
          | "DIRECT_CHALLENGE_RESPONSE_ACCEPT"
          | "DIRECT_CHALLENGE_RESPONSE_DECLINE"
        ),
        Toss["id"]
      ];

      if (type !== "TOSS") {
        return;
      }

      if (action.startsWith("SIDE_SELECT")) {
        await this.handleSideSelect({
          tossId,
          i,
          side: action === "SIDE_SELECT_HEADS" ? "HEADS" : "TAILS",
        });
      }

      if (action === "OPEN_CHALLENGE_RESPONSE_ACCEPT") {
        await this.handleOpenChallengeAccept({ tossId, i });
      }

      if (
        action === "DIRECT_CHALLENGE_RESPONSE_ACCEPT" ||
        "DIRECT_CHALLENGE_RESPONSE_DECLINE"
      ) {
        await this.handleDirectChallengeResponse({
          tossId,
          accepted: action === "DIRECT_CHALLENGE_RESPONSE_ACCEPT",
          i,
        });
      }
    });
  }

  static async contender(id: GuildMember["id"]): Promise<Contender> {
    const admin = Global.bot("ADMIN");

    const [user, member] = await Promise.all([
      User.findOneByOrFail({ id }),
      admin.guild.members.fetch(id),
    ]);

    return { user, member };
  }

  static async toss(i: CommandInteraction) {
    await i.deferReply({ ephemeral: true });

    const challenger = await this.contender(i.user.id);
    const amount = i.options.getInteger("amount", true);

    // Check balance
    if (challenger.user.gbt < amount) {
      await i.editReply({
        embeds: [
          {
            color: "DARK_RED",
            description: Utils.r(
              <>
                <UserMention id={i.user.id} /> - You don't *have*{" "}
                {Format.currency(amount)} to gamble with.
              </>
            ),
          },
          {
            color: "DARK_BLUE",
            description: Utils.r(
              <>
                **Hint**: Earn more {Config.emojiCode("GBT_COIN")} **$GBT** by
                completing <ChannelMention id={Config.channelId("QUESTS")} />.
              </>
            ),
          },
        ],
      });

      return;
    }

    const opponent = i.options.getMember("opponent") as null | GuildMember;
    const challengee = opponent ? await this.contender(opponent.id) : undefined;

    if (challengee && challengee.user.gbt < amount) {
      await i.editReply({
        embeds: [
          {
            color: "DARK_RED",
            description: Utils.r(
              <>
                <UserMention id={challengee.user.id} /> doesn't *have*{" "}
                {Format.currency(amount)} to gamble with.
              </>
            ),
          },
          {
            color: "DARK_BLUE",
            description: Utils.r(
              <>
                **Hint**: Leave the `opponent` option empty to challenge
                **anyone** in the channel.
              </>
            ),
          },
        ],
      });

      return;
    }

    const toss = Toss.create({
      type: challengee ? "DIRECT" : "OPEN",
      state: "INITIALISED",
      challenger: challenger.user,
      challengee: challengee?.user,
      channel: Config.channel(i.channelId),
      amount,
      rake: calculateTossRake(amount),
    });

    // Save toss to DB
    await toss.save();

    // Output Side Select
    await i.editReply(this.makeSideSelectEmbed(toss));

    // Update toss state
    toss.state = "SIDE_SELECT";
    toss.sideSelectToken = i.token;
    await toss.save();
  }

  static async handleSideSelect(props: {
    tossId: Toss["id"];
    i: ButtonInteraction;
    side: Toss["chosenSide"];
  }) {
    // Get DB Toss and Tosser bot
    const toss = await Toss.findOneByOrFail({ id: props.tossId });
    const tosser = Global.bot("TOSSER");

    // Check responding to own buttons
    if (props.i.user.id !== toss.challenger.id) {
      await props.i.reply({
        embeds: [
          {
            color: "DARK_RED",
            description: Utils.r(
              <>
                <UserMention id={props.i.user.id} /> - These buttons aren't for
                you.
              </>
            ),
          },
          {
            color: "DARK_BLUE",
            description: Utils.r(
              <>
                Type the `/toss` command if you want to **flip a coin** with{" "}
                <UserMention id={tosser.client.user!.id} />{" "}
                {Config.emojiCode("TOSSER_NPC")}
              </>
            ),
          },
        ],
        ephemeral: true,
      });

      return;
    }

    // Update DB
    toss.chosenSide = props.side;
    await toss.save();

    // Update side select message
    await Promise.all([
      props.i.update(
        this.makeSideSelectEmbed(toss) as InteractionUpdateOptions
      ),
    ]);

    // Output discovery message
    const channel = await Utils.ManagedChannel.getOrFail(
      toss.channel.id,
      "TOSSER"
    );

    const embed = toss.challengee
      ? this.makeDirectChallengeEmbed(toss)
      : this.makeOpenChallengeEmbed(toss);

    const challengeMessage = await channel.send(embed);

    // Save toss
    toss.challengeMessageId = challengeMessage.id;
    await toss.save();
  }

  static async handleDirectChallengeResponse(props: {
    tossId: Toss["id"];
    accepted: boolean;
    i: ButtonInteraction;
  }) {
    // Get DB Toss and Tosser bot
    const [toss, challengee] = await Promise.all([
      Toss.findOneByOrFail({ id: props.tossId }),
      User.findOneByOrFail({ id: props.i.user.id }),
    ]);

    const tosser = Global.bot("TOSSER");

    if (props.i.user.id !== toss.challengee.id) {
      await props.i.reply({
        embeds: [
          {
            color: "DARK_RED",
            description: Utils.r(
              <>
                <UserMention id={props.i.user.id} /> - These buttons aren't for
                you.
              </>
            ),
          },
          {
            color: "DARK_BLUE",
            description: Utils.r(
              <>
                Type the `/toss` command if you want to **flip a coin** with{" "}
                <UserMention id={tosser.client.user!.id} />{" "}
                {Config.emojiCode("TOSSER_NPC")}
              </>
            ),
          },
        ],
        ephemeral: true,
      });

      return;
    }

    if (!props.accepted) {
      toss.outcome = "CHALLENGEE_DECLINED";
      toss.state = "COMPLETE";

      await Promise.all([
        toss.save(),
        props.i.update(
          this.makeDirectChallengeEmbed(toss) as InteractionUpdateOptions
        ),
      ]);

      return;
    }

    // Update side select message
    const channel = await Utils.ManagedChannel.getOrFail(
      toss.channel.id,
      "TOSSER"
    );

    // Check challenger balance
    if (toss.challenger.gbt < toss.amount) {
      toss.outcome = "CHALLENGER_BALANCE_INSUFFICIENT";
      toss.state = "COMPLETE";

      await Promise.all([
        toss.save(),
        props.i.update(
          this.makeOpenChallengeEmbed(toss) as InteractionUpdateOptions
        ),
      ]);

      await channel.send({
        embeds: [
          {
            description: Utils.r(
              <>
                <UserMention id={challengee.id} /> accepted{" "}
                <UserMention id={toss.challenger.id} />
                's toss challenge, but <UserMention
                  id={toss.challenger.id}
                />{" "}
                no longer has {Format.currency(toss.amount)} to gamble with 🙄.
              </>
            ),
          },
        ],
      });

      return;
    }

    // Check challengee balance
    if (challengee.gbt < toss.amount) {
      await props.i.reply({
        embeds: [
          {
            color: "DARK_RED",
            description: Utils.r(
              <>
                <UserMention id={props.i.user.id} /> - You don't *have*{" "}
                {Format.currency(toss.amount)} to gamble with.
              </>
            ),
          },
          {
            color: "DARK_BLUE",
            description: Utils.r(
              <>
                **Hint**: Earn more {Config.emojiCode("GBT_COIN")} **$GBT** by
                completing <ChannelMention id={Config.channelId("QUESTS")} />.
              </>
            ),
          },
        ],
        ephemeral: true,
      });

      return;
    }

    // Perform coin toss
    const commit = await this.commit(toss);
    const options = this.makeDirectChallengeEmbed(toss);

    await Promise.all([
      props.i.update(options as InteractionUpdateOptions),
      channel.send(await this.makeTossResultEmbed(toss, commit)),
    ]);
  }

  static async handleOpenChallengeAccept(props: {
    tossId: Toss["id"];
    i: ButtonInteraction;
  }) {
    // Get DB Toss and Tosser bot
    const [toss, challengee] = await Promise.all([
      Toss.findOneByOrFail({ id: props.tossId }),
      User.findOneByOrFail({ id: props.i.user.id }),
    ]);

    // Update side select message
    const channel = await Utils.ManagedChannel.getOrFail(
      toss.channel.id,
      "TOSSER"
    );

    // Check challenger balance
    if (toss.challenger.gbt < toss.amount) {
      toss.outcome = "CHALLENGER_BALANCE_INSUFFICIENT";
      toss.state = "COMPLETE";
      toss.challengee = challengee;

      await Promise.all([
        toss.save(),
        props.i.update(
          this.makeOpenChallengeEmbed(toss) as InteractionUpdateOptions
        ),
      ]);

      await channel.send({
        embeds: [
          {
            description: Utils.r(
              <>
                <UserMention id={challengee.id} /> accepted{" "}
                <UserMention id={toss.challenger.id} />
                's toss challenge, but <UserMention
                  id={toss.challenger.id}
                />{" "}
                no longer has {Format.currency(toss.amount)} to gamble with 🙄.
              </>
            ),
          },
        ],
      });

      return;
    }

    // Check challengee balance
    if (challengee.gbt < toss.amount) {
      await props.i.reply({
        embeds: [
          {
            color: "DARK_RED",
            description: Utils.r(
              <>
                <UserMention id={props.i.user.id} /> - You don't have{" "}
                {Format.currency(toss.amount)} to gamble with.
              </>
            ),
          },
          {
            color: "DARK_BLUE",
            description: Utils.r(
              <>
                Earn more {Config.emojiCode("GBT_COIN")} **$GBT** by completing{" "}
                <ChannelMention id={Config.channelId("QUESTS")} />.
              </>
            ),
          },
        ],
      });

      return;
    }

    // Perform coin toss
    toss.challengee = challengee;
    const commit = await this.commit(toss);

    const options = this.makeOpenChallengeEmbed(toss);

    await Promise.all([
      props.i.update(options as InteractionUpdateOptions),
      channel.send(await this.makeTossResultEmbed(toss, commit)),
    ]);
  }

  static async commit(toss: Toss): Promise<Commit> {
    toss.flippedSide = Math.random() < 0.5 ? "HEADS" : "TAILS";

    const tosser = await this.contender(Config.clientId("TOSSER"));
    tosser.user.gbt += toss.rake;
    await tosser.user.save();

    if (toss.challenger.id === toss.challengee.id) {
      toss.challenger.gbt -= toss.rake;
      toss.state = "COMPLETE";
      toss.outcome = "TOSSED_SELF";

      await toss.save();

      return {
        type: "SELF",
        data: { yld: -toss.rake },
      };
    }

    const winner =
      toss.chosenSide === toss.flippedSide ? "CHALLENGER" : "CHALLENGEE";

    const yld = {
      challenger:
        winner === "CHALLENGER" ? toss.amount - toss.rake : -toss.amount,
      challengee:
        winner == "CHALLENGEE" ? toss.amount - toss.rake : -toss.amount,
    };

    toss.challenger.gbt += yld.challenger;
    toss.challengee.gbt += yld.challengee;

    toss.state = "COMPLETE";

    toss.outcome =
      toss.chosenSide === toss.flippedSide
        ? "CHALLENGER_WON"
        : "CHALLENGEE_WON";

    await toss.save();

    return {
      type: "OPPONENT",
      data: {
        winner,
        yld,
      },
    };
  }

  static async makeTossResultEmbed(
    toss: Toss,
    commit: Commit
  ): Promise<MessageOptions> {
    const [challenger, challengee, tosser] = await Promise.all([
      this.contender(toss.challenger.id),
      this.contender(toss.challengee.id),
      this.contender(Config.clientId("TOSSER")),
    ]);

    const gif = {
      TAILS: "https://s10.gifyu.com/images/tails-coin-static.gif",
      HEADS: "https://s10.gifyu.com/images/heads-coin-smaller-static-win.gif",
    }[toss.flippedSide];

    if (commit.type === "SELF") {
      return {
        embeds: [
          {
            author: {
              name: "Toss Results",
              icon_url: tosser.member.displayAvatarURL(),
            },
            thumbnail: { url: gif },
            description: Utils.r(
              <>
                It was **{toss.flippedSide}**! {toss.challenger.mention}
                tossed.. themself.
              </>
            ),
            fields: [{ name: "Challengee", value: toss.challengee.mention }],
          },
          {
            author: {
              name: toss.challenger.displayName,
              icon_url: challenger.member.displayAvatarURL(),
            },
            description: Format.transaction(
              toss.challenger.gbt - commit.data.yld,
              commit.data.yld
            ),
            color: "DARK_RED",
          },
          {
            author: {
              name: tosser.member.displayName,
              icon_url: tosser.member.displayAvatarURL(),
            },
            description: Format.transaction(
              tosser.user.gbt + commit.data.yld,
              -commit.data.yld
            ),
            color: "DARK_GREEN",
          },
        ],
      };
    }

    return {
      embeds: [
        {
          author: {
            name: "Toss Results",
            icon_url: tosser.member.displayAvatarURL(),
          },
          thumbnail: { url: gif },
          description: Utils.r(
            <>
              It was **{toss.flippedSide}**! {toss.challenger.mention}{" "}
              {commit.data.winner === "CHALLENGER" ? "won" : "lost"}
            </>
          ),
          fields: [{ name: "Challengee", value: toss.challengee.mention }],
        },
        {
          author: {
            name: toss.challenger.displayName,
            icon_url: challenger.member.displayAvatarURL(),
          },
          description: Format.transaction(
            toss.challenger.gbt - commit.data.yld.challenger,
            commit.data.yld.challenger
          ),
          color:
            commit.data.winner === "CHALLENGER" ? "DARK_GREEN" : "DARK_RED",
        },
        {
          author: {
            name: toss.challengee.displayName,
            icon_url: challengee.member.displayAvatarURL(),
          },
          description: Format.transaction(
            toss.challengee.gbt - commit.data.yld.challengee,
            commit.data.yld.challengee
          ),
          color:
            commit.data.winner === "CHALLENGEE" ? "DARK_GREEN" : "DARK_RED",
        },
      ],
    };
  }

  static makeSideSelectEmbed(toss: Toss): MessageOptions {
    const [heads, tails] = [
      Config.emojis.find((e) => e.id === "COIN_HEADS")!,
      Config.emojis.find((e) => e.id === "COIN_TAILS")!,
    ];

    return {
      embeds: [
        {
          description: Utils.r(
            <>
              <UserMention id={toss.challenger.id} /> - What ya thinking.{" "}
              {Config.emojiCode("COIN_HEADS")} `Heads` or{" "}
              {Config.emojiCode("COIN_TAILS")} `Tails`?
            </>
          ),
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`TOSS:SIDE_SELECT_HEADS:${toss.id}`)
            .setEmoji(heads.identifier)
            .setLabel("Heads")
            .setStyle(
              toss.chosenSide === null || toss.chosenSide === "HEADS"
                ? "DANGER"
                : "SECONDARY"
            )
            .setDisabled(toss.chosenSide !== null),
          new MessageButton()
            .setCustomId(`TOSS:SIDE_SELECT_TAILS:${toss.id}`)
            .setEmoji(tails.identifier)
            .setLabel("Tails")
            .setStyle(
              toss.chosenSide === null || toss.chosenSide === "TAILS"
                ? "DANGER"
                : "SECONDARY"
            )
            .setDisabled(toss.chosenSide !== null)
        ),
      ],
    };
  }

  static makeDirectChallengeEmbed(toss: Toss): MessageOptions {
    const [tiger, chicken] = [
      Config.emojis.find((e) => e.id === "TIGER_BLOOD")!,
      Config.emojis.find((e) => e.id === "CHICKEN")!,
    ];

    function acceptStyle(toss: Toss): MessageButtonStyleResolvable {
      if (toss.state === "COMPLETE") {
        return toss.outcome === "CHALLENGEE_DECLINED" ? "SECONDARY" : "DANGER";
      }
      return "DANGER";
    }

    function declineStyle(toss: Toss): MessageButtonStyleResolvable {
      if (toss.state === "COMPLETE") {
        return toss.outcome === "CHALLENGEE_DECLINED" ? "DANGER" : "SECONDARY";
      }
      return "DANGER";
    }

    return {
      embeds: [
        {
          description: Utils.r(
            <>
              <UserMention id={toss.challengee.id} />,{" "}
              <UserMention id={toss.challenger.id} /> has challenged you to a
              toss for {Format.currency(toss.amount)}. You in?
            </>
          ),
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`TOSS:DIRECT_CHALLENGE_RESPONSE_ACCEPT:${toss.id}`)
            .setEmoji(tiger.identifier)
            .setLabel("Accept")
            .setStyle(acceptStyle(toss))
            .setDisabled(toss.state === "COMPLETE"),
          new MessageButton()
            .setCustomId(`TOSS:DIRECT_CHALLENGE_RESPONSE_DECLINE:${toss.id}`)
            .setEmoji(chicken.identifier)
            .setLabel("Decline")
            .setStyle(declineStyle(toss))
            .setDisabled(toss.state === "COMPLETE")
        ),
      ],
    };
  }

  static makeOpenChallengeEmbed(toss: Toss): MessageOptions {
    const [heads, tails] = [
      Config.emojis.find((e) => e.id === "COIN_HEADS")!,
      Config.emojis.find((e) => e.id === "COIN_TAILS")!,
    ];

    return {
      embeds: [
        {
          description: Utils.r(
            <>
              <UserMention id={toss.challenger.id} /> has challenged **anyone**
              to a toss for {Format.currency(toss.amount)}. Any takers?
            </>
          ),
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`TOSS:OPEN_CHALLENGE_RESPONSE_ACCEPT:${toss.id}`)
            .setEmoji((toss.chosenSide === "HEADS" ? heads : tails).identifier)
            .setLabel(
              `Bet ${toss.amount} on ${
                toss.chosenSide === "HEADS" ? "tails" : "heads"
              }`
            )
            .setStyle(toss.state === "COMPLETE" ? "SECONDARY" : "DANGER")
            .setDisabled(toss.state === "COMPLETE")
        ),
      ],
    };
  }

  static async cancel(toss: Toss) {
    await this.rest.patch(
      Routes.webhookMessage(Config.clientId("TOSSER"), toss.sideSelectToken),
      { body: this.makeSideSelectEmbed(toss) }
    );
  }
}
