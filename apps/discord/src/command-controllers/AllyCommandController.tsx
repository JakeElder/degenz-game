import React from "react";
import {
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageSelectMenu,
  SelectMenuInteraction,
  TextBasedChannel,
  TextChannel,
} from "discord.js";
import Config from "config";
import { CommandController } from "../CommandController";
import {
  eatItem,
  getImprisonmentByCellChannelId,
  getMartItems,
  getUser,
  getUserByApartment,
  getUserByBunk,
} from "../legacy/db";
import { Achievement as AchievementEnum, MartItemSymbol } from "data/types";
import { User } from "data/db";
import { groupBy } from "lodash";
import OnboardController from "../controllers/OnboardController";
import { makeInventoryEmbed } from "../legacy/utils";
import ChannelHelpOutput from "../legacy/channel-help";
import Utils from "../Utils";
import { Global } from "../Global";
import Events from "../Events";
import Stats from "../Stats";
import { LeaderboardController } from "../controllers/LeaderboardController";
import { Format } from "lib";

const { r } = Utils;

export default class AllyCommandController extends CommandController {
  async eat(i: CommandInteraction) {
    const items = await getMartItems();
    const user = (await getUser(i.user.id))!;

    const groups = groupBy(user.martItemOwnerships, "item.symbol");

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("foodSelect")
        .setPlaceholder("Choose from your inventory")
        .addOptions(
          Object.keys(groups).map((g) => {
            const i = items.find((i) => i.symbol === g)!;
            return {
              label: `${i.name}`,
              description: `[${groups[g].length}] available [effect] +${i.strengthIncrease} stength`,
              value: g,
            };
          })
        )
    );

    await i.reply({
      content: `What you eating fam?`,
      components: [row],
      ephemeral: true,
    });
  }

  async redpill(i: CommandInteraction) {
    const member = i.member as GuildMember;

    if (member.roles.cache.has(Config.roleId("DEGEN"))) {
      await i.reply({ content: "What.. Again?", ephemeral: true });
      return;
    }

    i.reply({ content: "`REDPILL_TAKEN`", ephemeral: true });
    const user = await getUser(member.id);
    Events.emit("REDPILL_TAKEN", { user });
    await OnboardController.partThree(user);
  }

  async help(i: CommandInteraction) {
    const ally = Global.bot("ALLY");
    const channel = i.channel as TextChannel;

    const [member, apartmentUser, imprisonment, bunkUser] = await Promise.all([
      ally.getMember(i.user.id),
      getUserByApartment(channel.id),
      getImprisonmentByCellChannelId(channel.id),
      getUserByBunk(channel.id),
    ]);

    const isApartment = typeof apartmentUser !== "undefined";
    const isCell = typeof imprisonment !== "undefined";
    const isBunk = typeof bunkUser !== "undefined";

    let t: React.ComponentProps<typeof ChannelHelpOutput>["type"] = (() => {
      if (isCell) return "CELL";
      if (isApartment) return "APARTMENT";
      if (isBunk) return "BUNK";
      return "WORLD";
    })();

    await i.reply({
      content: r(
        <ChannelHelpOutput
          channel={i.channel as TextBasedChannel}
          member={member!}
          type={t}
          cellNumber={isCell ? imprisonment.cellNumber : undefined}
          apartmentUser={apartmentUser}
          bunkUser={bunkUser}
        />
      ),
      ephemeral: true,
    });

    const user = await getUser(member!.id);
    Events.emit("HELP_REQUESTED", { user, channel });

    if (!user.hasAchievement(AchievementEnum.HELP_REQUESTED)) {
      await OnboardController.partFive(user);
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

    await i.reply({
      embeds: [
        e,
        {
          author: {
            icon_url: `https://stage.degenz.game/info.png`,
            name: "Info",
          },
          color: "BLUE",
          description:
            "Your NFT will be your in game character, it's attributes and rarity will grant you special abilities in game.",
        },
      ],
      ephemeral: true,
    });

    if (!checkeeUser.hasAchievement(AchievementEnum.STATS_CHECKED)) {
      await OnboardController.partFour(checkeeUser);
    }

    Events.emit("STATS_CHECKED", {
      checkee: checkeeUser,
      checker: checkerUser,
      channel: i.channel as TextChannel,
    });
  }

  async leaderboard(i: CommandInteraction) {
    const num = i.options.getNumber("top") || 30;
    const leaders = await User.find({
      where: { inGame: true },
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

    const e = makeInventoryEmbed(await getMartItems(), users[1], checkee);
    await i.reply({ embeds: [e], ephemeral: true });

    Events.emit("INVENTORY_CHECKED", {
      checker: users[0],
      checkee: users[1],
    });
  }

  async handleFoodSelect(i: SelectMenuInteraction) {
    const items = await getMartItems();
    const res = await eatItem(i.values[0] as MartItemSymbol, i.user.id);

    const item = items.find((item) => item.symbol === i.values[0])!;

    if (res.success) {
      await i.update({
        content: `You ate **${item.name}**. \`+${item.strengthIncrease} strength\``,
        components: [],
      });

      const user = await getUser(i.user.id);
      Events.emit("ITEM_EATEN", { user, item });

      return;
    }

    await i.update({ content: "Error", components: [] });
  }
}
