import React from "react";
import {
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageSelectMenu,
  SelectMenuInteraction,
  TextChannel,
} from "discord.js";
import { CommandController } from "../CommandController";
import { getUser } from "../legacy/db";
import { MartItemSymbol } from "data/types";
import { Dormitory, MartItem, MartItemOwnership, User } from "data/db";
import OnboardController from "../controllers/OnboardController";
import { makeInventoryEmbed } from "../legacy/utils";
import { Global } from "../Global";
import Events from "../Events";
import Stats from "../Stats";
import { LeaderboardController } from "../controllers/LeaderboardController";
import { Format } from "lib";
import { Channel } from "../Channel";
import { Help } from "../Help";
import { channelMention, userMention } from "@discordjs/builders";
import Utils from "../Utils";
import Config from "config";
import { IsNull, Not } from "typeorm";

export default class AllyCommandController extends CommandController {
  async eat(i: CommandInteraction) {
    const [user, items, inventory] = await Promise.all([
      User.findOneByOrFail({ id: i.user.id }),
      MartItem.find({ order: { price: -1 } }),
      MartItemOwnership.createQueryBuilder("mart_item_ownership")
        .select(["item_id", "Count(*)"])
        .where({ user: { id: i.user.id } })
        .groupBy("item_id")
        .getRawMany<{ item_id: MartItemSymbol; count: string }>(),
    ]);

    if (inventory.length === 0) {
      await i.reply({
        embeds: [
          {
            color: "RED",
            description: Utils.r(
              <>
                **{user.displayName}** - You don't *have* any food..{" "}
                {items.map((i) => `${i.emoji}`)}
                <br />
                You should go to {channelMention(Config.channelId("MART"))} and
                buy some!
              </>
            ),
          },
        ],
      });
      return;
    }

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("foodSelect")
        .setPlaceholder("Choose from your inventory")
        .addOptions(
          inventory.map((g) => {
            const item = items.find((i) => i.id === g.item_id)!;
            return {
              label: item.name,
              description: `[${
                g.count
              }] available [effect] +${item.strengthIncrease!} stength`,
              value: `${i.user.id}:${item.id}`,
            };
          })
        )
    );

    await i.reply({
      embeds: [
        {
          description: Utils.r(
            <>
              **{user.displayName}** - What you eating fam?{" "}
              {items.map((i) => `${i.emoji}`)}
            </>
          ),
        },
      ],
      components: [row],
    });
  }

  async handleFoodSelect(i: SelectMenuInteraction) {
    const [userId, itemId] = i.values[0].split(":") as [
      User["id"],
      MartItemSymbol
    ];

    if (i.user.id !== userId) {
      i.reply({
        content: Utils.r(
          <>
            {userMention(i.user.id)} - This is not for you! type the `/eat`
            slash command if you want to eat something.
          </>
        ),
        ephemeral: true,
      });
    }

    const [item, user] = await Promise.all([
      MartItem.findOneByOrFail({ id: itemId }),
      User.findOneByOrFail({ id: i.user.id }),
    ]);

    const ownership = await MartItemOwnership.findOne({
      where: {
        item: { id: item.id },
        user: { id: user.id },
      },
    });

    if (!ownership) {
      await i.update({ content: "Error", components: [], embeds: [] });
      return;
    }

    const strengthBefore = user.strength;

    user.strength = Math.max(
      Math.min(100, user.strength + item.strengthIncrease),
      0
    );

    await Promise.all([ownership.softRemove(), user.save()]);

    await i.update({
      embeds: [
        {
          description: Utils.r(
            <>
              **{user.displayName}** Ate {item.emoji.toString()} **{item.name}**
              `
              {Format.powerChange(
                strengthBefore,
                user.strength - strengthBefore
              )}
              `
            </>
          ),
        },
      ],
      components: [],
    });

    Events.emit("ITEM_EATEN", { user, item, strengthBefore });
  }

  async redpill(i: CommandInteraction) {
    const channel = await Channel.getDescriptor(i.channelId);
    const user = await User.findOneOrFail({ where: { id: i.user.id } });

    if (user.hasAchievement("JOIN_THE_DEGENZ_QUEST_COMPLETED")) {
      await i.reply({ content: "What.. Again?", ephemeral: true });
      return;
    }

    if (!channel.isApartment && !channel.isOnboardingThread) {
      if (user.onboardingChannel) {
        await i.reply({
          content: Utils.r(
            <>
              {userMention(i.user.id)} - Here? Go to{" "}
              {channelMention(user.onboardingChannel.id)} if you want to join
              the Degenz.
            </>
          ),
          ephemeral: true,
        });
      } else {
        await i.reply({
          content: Utils.r(
            <>
              {userMention(i.user.id)} - Here? Go to{" "}
              {channelMention(Config.channelId("QUESTS"))} and start the *Join
              the Degenz* quest to `/redpill`.
            </>
          ),
          ephemeral: true,
        });
      }
      return;
    }

    i.reply({ content: "`REDPILL_TAKEN`", ephemeral: true });

    Events.emit("REDPILL_TAKEN", { user });
    await OnboardController.sendRedPillTakenResponse(user);
  }

  async help(i: CommandInteraction) {
    const admin = Global.bot("ADMIN");

    const [channelDescriptor, channel, member, dormitories] = await Promise.all(
      [
        Channel.getDescriptor(i.channelId),
        Utils.Channel.getOrFail(i.channelId),
        admin.getMember(i.user.id),
        Dormitory.find({ relations: ["tenancies"] }),
      ]
    );

    await i.reply({
      ...Help.generate({
        channel: channelDescriptor,
        member: member!,
        dormitories,
      }),
      ephemeral: true,
    });

    const user = await getUser(member!.id);
    Events.emit("HELP_REQUESTED", { user, channel });

    if (!user.hasAchievement("HELP_REQUESTED")) {
      await OnboardController.sendHelpRequestedResponse(user);
    }
  }

  async stats(i: CommandInteraction) {
    const checkeeMember = i.options.getMember("name") as null | GuildMember;

    const [checkerUser, checkeeUser] = await Promise.all([
      getUser(i.user.id),
      getUser(checkeeMember ? checkeeMember.id : i.user.id),
    ]);

    if (checkeeUser === null) {
      await i.reply({ content: "Citizen not found", ephemeral: true });
      return;
    }

    const e = Stats.makeEmbed({
      member: checkeeMember || (i.member as GuildMember),
      imageURL: "https://s10.gifyu.com/images/RandomDegenz.gif-1.gif",
      strength: checkeeUser.strength,
      gbt: checkeeUser.gbt,
      level: 1,
      attributes: {
        strength: "??",
        charisma: "??",
        luck: "??",
      },
    });

    await i.reply({ embeds: [e], ephemeral: true });

    // if (!checkeeUser.hasAchievement("STATS_CHECKED")) {
    //   await OnboardController.sendStatsCheckedResponse(checkeeUser);
    // }

    Events.emit("STATS_CHECKED", {
      checkee: checkeeUser,
      checker: checkerUser,
      channel: i.channel as TextChannel,
    });
  }

  async leaderboard(i: CommandInteraction) {
    const num = i.options.getNumber("top") || 30;
    const leaders = await User.find({
      where: { inGame: true, gbt: Not(IsNull()) },
      order: { gbt: -1 },
      take: num,
    });

    const show = i.options.getBoolean("post");

    const data = await LeaderboardController.computeData(leaders);

    if (num === 5) {
      const embeds = LeaderboardController.makeEmbeds(data);
      await i.reply({ embeds, ephemeral: !show });
    } else {
      const table = LeaderboardController.makeTable(data, 0);
      await i.reply({ content: Format.codeBlock(table), ephemeral: !show });
    }
  }

  async inventory(i: CommandInteraction) {
    const checker = i.member as GuildMember;
    let checkee = i.options.getMember("name") as null | GuildMember;

    if (!checkee) {
      checkee = checker;
    }

    const users = await Promise.all([getUser(checker.id), getUser(checkee.id)]);

    if (users[1] === null) {
      await i.reply({ content: "Citizen not found", ephemeral: true });
      return;
    }

    const e = await makeInventoryEmbed(users[1], checkee);
    await i.reply({ embeds: [e], ephemeral: true });

    Events.emit("INVENTORY_CHECKED", {
      checker: users[0],
      checkee: users[1],
    });
  }
}
