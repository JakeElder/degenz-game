import React from "react";
import {
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageSelectMenu,
  SelectMenuInteraction,
  TextBasedChannel,
} from "discord.js";
import Config from "app-config";
import { CommandController } from "../CommandController";
import {
  eatItem,
  getImprisonmentByCellChannelId,
  getLeaders,
  getMartItems,
  getUser,
  getUserByApartment,
} from "../legacy/db";
import { Achievement as AchievementEnum } from "types";
import { groupBy } from "lodash";
import OnboardController from "../controllers/OnboardController";
import {
  makeInventoryEmbed,
  makeLeaderboardEmbed,
  makeUserStatsEmbed,
} from "../legacy/utils";
import ChannelHelpOutput from "../legacy/channel-help";
import Utils from "../Utils";
import { Global } from "../Global";

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

    i.reply("`REDPILL_TAKEN`");
    const user = await getUser(member.id);
    await OnboardController.partThree(user);
  }

  async help(i: CommandInteraction) {
    const ally = Global.bot("ALLY");
    const channel = i.channel as TextBasedChannel;

    const [member, apartmentUser, imprisonment] = await Promise.all([
      ally.getMember(i.user.id),
      getUserByApartment(channel.id),
      getImprisonmentByCellChannelId(channel.id),
    ]);

    const isApartment = typeof apartmentUser !== "undefined";
    const isCell = typeof imprisonment !== "undefined";

    let t: React.ComponentProps<typeof ChannelHelpOutput>["type"] = (() => {
      if (isCell) return "CELL";
      if (isApartment) return "APARTMENT";
      return "WORLD";
    })();

    await i.reply({
      content: r(
        <ChannelHelpOutput
          channel={i.channel as TextBasedChannel}
          member={member}
          type={t}
          cellNumber={isCell ? imprisonment.cellNumber : undefined}
          apartmentUser={apartmentUser}
        />
      ),
      ephemeral: true,
    });

    const user = await getUser(member.id);

    if (!user.hasAchievement(AchievementEnum.HELP_REQUESTED)) {
      await OnboardController.partFive(user);
    }

    // this.emit("WORLD_EVENT", {
    //   event: "HELP_REQUESTED",
    //   data: { member, channel: i.channel as TextBasedChannel },
    // });
  }

  async stats(i: CommandInteraction) {
    let member = i.options.getMember("name") as null | GuildMember;
    // let ownStats = false;

    if (!member) {
      // ownStats = true;
      member = i.member as GuildMember;
    }

    const user = await getUser(member.id);

    if (user === null) {
      await i.reply({ content: "Citizen not found", ephemeral: true });
      return;
    }

    const e = makeUserStatsEmbed(user, member);
    await i.reply({ embeds: [e], ephemeral: true });

    if (!user.hasAchievement(AchievementEnum.STATS_CHECKED)) {
      await OnboardController.partFour(user);
    }

    // this.emit("WORLD_EVENT", {
    //   event: "STATS_CHECKED",
    //   data: {
    //     member: i.member as GuildMember,
    //     checkee: ownStats ? null : member,
    //   },
    // });
  }

  async leaderboard(i: CommandInteraction) {
    const show = i.options.getBoolean("post");
    const num = i.options.getNumber("top");

    const leaders = await getLeaders(num || 30);

    const m = makeLeaderboardEmbed(leaders);
    await i.reply({ embeds: [m], ephemeral: !show });
  }

  async inventory(i: CommandInteraction) {
    let member = i.options.getMember("name") as null | GuildMember;
    // let ownInventory = false;

    if (!member) {
      // ownInventory = true;
      member = i.member as GuildMember;
    }

    const user = await getUser(member.id);

    if (user === null) {
      await i.reply({ content: "Citizen not found", ephemeral: true });
      return;
    }

    const e = makeInventoryEmbed(await getMartItems(), user, member);
    await i.reply({ embeds: [e], ephemeral: true });

    // this.emit("WORLD_EVENT", {
    //   event: "INVENTORY_CHECKED",
    //   data: {
    //     member: i.member as GuildMember,
    //     checkee: ownInventory ? null : member,
    //   },
    // });
  }

  async handleFoodSelect(i: SelectMenuInteraction) {
    const items = await getMartItems();
    const res = await eatItem(i.values[0], i.user.id);

    const item = items.find((item) => item.symbol === i.values[0])!;

    if (res.success) {
      await i.update({
        content: `You ate **${item.name}**. \`+${item.strengthIncrease} strength\``,
        components: [],
      });

      // const member = await ally.getMember(i.user.id);

      // const e: ItemEatenEvent = {
      //   event: "ITEM_EATEN",
      //   data: { member, item: item },
      // };

      // this.emit("WORLD_EVENT", e);

      return;
    }

    await i.update({ content: "Error", components: [] });
  }
}
