import Config from "config";
import { GenOneToken, MintPassAssignment, User } from "data/db";
import {
  ButtonInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEditOptions,
  MessageOptions,
  Modal,
  ModalActionRowComponent,
  ModalSubmitInteraction,
  TextInputComponent,
  Util,
} from "discord.js";
import { Global } from "../Global";
import { PersistentMessageController } from "./PersistentMessageController";
import dedent from "dedent";
import Utils from "../Utils";
import UserController from "./UserController";
import { channelMention } from "@discordjs/builders";
import Events from "../Events";

export default class MintPassClaimController {
  static async init() {
    await this.bindButtonListeners();
    await this.update();
  }

  static async update() {
    await this.setMessage();
  }

  static async bindButtonListeners() {
    const ally = Global.bot("ALLY");
    const bb = Global.bot("BIG_BROTHER");

    ally.client.on("interactionCreate", async (i) => {
      if (i.isButton() && i.customId === "REDEEM_MINT_PASS") {
        this.handleButtonPress(i);
      }

      if (
        i.isModalSubmit() &&
        i.customId.startsWith("NFT_CLAIM_WALLET_MODAL")
      ) {
        this.handleWalletSubmit(i);
      }
    });

    bb.client.on("interactionCreate", async (i) => {
      if (i.isButton() && i.customId.startsWith("MARK_MINT_PASS_FULFILLED")) {
        this.handleFulfilledButtonPress(i);
      }
    });
  }

  static async setMessage() {
    const description = dedent`
        ${Utils.numberEmoji(0)} Press the button below
        ${Utils.numberEmoji(1)} Enter your **Solana** wallet address
        ${Utils.numberEmoji(2)} An admin will drop your token within 24 hours

        🍀 **Good luck Degenz!**
`;

    // > Your NFT will be selected at **random** from the 333 premints sent by ${Config.emojiCode(
    //   "MAGIC_EDEN"
    // )} Magic Eden.

    // > Use the \`/stats\` command to see how many mint passes you have.

    // > Any problems? Open a ticket in ${channelMention(
    //   Config.channelId("SUPPORT")
    // )}

    const message: MessageOptions = {
      embeds: [
        {
          author: {
            name: "To Claim Your Mint Pass",
          },
          color: Util.resolveColor("NOT_QUITE_BLACK"),
          description,
          image: {
            url: "https://stage.degenz.game/degenz-game-character-preview.gif",
          },
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("REDEEM_MINT_PASS")
            .setEmoji(Config.emojiCode("DEGEN_W"))
            .setStyle("DANGER")
            .setLabel("Redeem Mint Pass")
        ),
      ],
    };

    await PersistentMessageController.set("REDEEM_MINT_PASS", message);
  }

  static async sendNoMintPassError(
    i: ButtonInteraction | ModalSubmitInteraction
  ) {
    await i.reply({
      embeds: [
        {
          color: "DARK_RED",
          title: "⚠️ You don't have any mint passes.",
          description: `If you think this is an \`error\`, please open a ticket in ${channelMention(
            Config.channelId("SUPPORT")
          )}`,
        },
      ],
      ephemeral: true,
    });
  }

  static async handleButtonPress(i: ButtonInteraction) {
    const user = await User.findOneOrFail({ where: { id: i.user.id } });

    if (user.mintPasses === 0) {
      await this.sendNoMintPassError(i);
      return;
    }

    const modal = new Modal()
      .setCustomId(`NFT_CLAIM_WALLET_MODAL:${i.user.id}`)
      .setTitle(`Where should we send your NFT?`);

    const hobbiesInput = new TextInputComponent()
      .setCustomId("wallet")
      .setLabel("Solana Wallet Address")
      .setStyle("PARAGRAPH");

    const firstActionRow =
      new MessageActionRow<ModalActionRowComponent>().addComponents(
        hobbiesInput
      );

    modal.addComponents(firstActionRow);

    await i.showModal(modal);
  }

  static async handleWalletSubmit(i: ModalSubmitInteraction) {
    const user = await User.findOneByOrFail({ id: i.user.id });
    const member = await UserController.getMember(i.user.id);

    const txWallet = i.fields.getTextInputValue("wallet");

    if (!Utils.isValidSolAddress(txWallet)) {
      await i.reply({
        embeds: [
          {
            color: "DARK_RED",
            title: "⚠️ Invalid Wallet Address",
            description:
              "Check you are entering a valid **Solana** wallet and then try again.",
          },
        ],
        ephemeral: true,
      });

      return;
    }

    if (user.mintPasses === 0) {
      await this.sendNoMintPassError(i);
      return;
    }

    const nft = await GenOneToken.createQueryBuilder()
      .select()
      .where({ locked: false, state: "OWNED_INTERNALLY" })
      .orderBy("RANDOM()")
      .getOneOrFail();

    await i.reply({
      ephemeral: true,
      embeds: [
        {
          color: "GOLD",
          title: `🎉 You got ${nft.name}!`,
          description: dedent`
            A **Degenz Team Admin** will airdrop this NFT to you within 24 hours.
          `,
          image: { url: nft.image },
        },
        {
          color: "DARK_GREEN",
          description: dedent`
          🦄 **Rarity**: \`${nft.rank}\`
          `,
        },
        {
          color: "DARK_GREEN",
          description: dedent`
          🍬 **Remaining Mint Passes**: \`${user.mintPasses - 1}\`
          `,
        },
      ],
    });

    const channel = await Utils.ManagedChannel.getOrFail(
      "NFT_CLAIM_LOG",
      "BIG_BROTHER"
    );

    const mpa = MintPassAssignment.create({
      recipient: { id: user.id },
      token: { id: nft.id },
      fulfilled: false,
      txWallet,
    });

    await mpa.save();

    mpa.recipient = user;
    mpa.token = nft;

    const message = await channel.send(this.makeLogMessage({ member, mpa }));
    Events.emit("MINT_PASS_REDEEMED", { mpa });

    user.mintPasses -= 1;
    mpa.logMessageId = message.id;
    nft.state = "AWAITING_TX_OUT";

    await Promise.all([mpa.save(), nft.save(), user.save()]);
  }

  static async handleFulfilledButtonPress(i: ButtonInteraction) {
    const presser = await UserController.getMember(i.user.id);
    if (!presser.roles.cache.has(Config.roleId("ADMIN"))) {
      await i.reply({
        embeds: [
          {
            color: "DARK_RED",
            title: "⚠️ Permission Denied.",
            description: `Only admins can mark as complete.`,
          },
        ],
        ephemeral: true,
      });
      return;
    }

    const mpaId = i.customId.split(":")[1];

    const mpa = await MintPassAssignment.findOneOrFail({
      where: { id: parseInt(mpaId, 10) },
    });

    mpa.fulfilled = true;
    mpa.token.state = "OWNED_EXTERNALLY";

    await mpa.save();

    Events.emit("MINT_PASS_SENT", { mpa });

    const channel = await Utils.ManagedChannel.getOrFail(
      "NFT_CLAIM_LOG",
      "BIG_BROTHER"
    );

    const [message, member] = await Promise.all([
      channel.messages.fetch(mpa.logMessageId),
      UserController.getMember(mpa.recipient.id),
    ]);

    await message.edit(
      this.makeLogMessage({ member, mpa }) as MessageEditOptions
    );

    await i.update({ fetchReply: false });
  }

  static makeLogMessage({
    member,
    mpa,
  }: {
    member: GuildMember;
    mpa: MintPassAssignment;
  }): MessageOptions {
    return {
      embeds: [
        {
          color: mpa.fulfilled ? "GREY" : "ORANGE",
          author: {
            icon_url: member.displayAvatarURL(),
            name: member.displayName,
          },
          thumbnail: { url: mpa.token.image },
          fields: [
            {
              name: "Member",
              value: mpa.recipient.mention,
            },
            {
              name: "NFT",
              value: `${mpa.token.name} (rarity: ${mpa.token.rank})`,
            },
            {
              name: "Wallet",
              value: mpa.txWallet,
            },
          ],
        },
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`MARK_MINT_PASS_FULFILLED:${mpa.id}`)
            .setLabel(mpa.fulfilled ? "Transferred" : "Mark as Complete")
            .setStyle(mpa.fulfilled ? "SECONDARY" : "PRIMARY")
            .setDisabled(mpa.fulfilled)
        ),
      ],
    };
  }
}
