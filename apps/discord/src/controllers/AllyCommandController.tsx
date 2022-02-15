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
  getCellByChannelId,
  getLeaders,
  getMartItems,
  getUser,
  getUserByApartment,
} from "../legacy/db";
import { groupBy } from "lodash";
import Runner from "../Runner";
import { Achievement } from "../legacy/types";
import OnboardController from "./OnboardController";
import {
  makeInventoryEmbed,
  makeLeaderboardEmbed,
  makeUserStatsEmbed,
} from "../legacy/utils";
import ChannelHelpOutput from "../legacy/channel-help";
import Utils from "../Utils";

const { r } = Utils;

export default class AllyCommandController extends CommandController {
  async eat(i: CommandInteraction, runner: Runner) {
    const items = await getMartItems();
    const user = (await getUser(i.user.id))!;

    const groups = groupBy(user.items, "itemId");

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("foodSelect")
        .setPlaceholder("Choose from your inventory")
        .addOptions(
          Object.keys(groups).map((g) => {
            const i = items.find((i) => i.id === g)!;
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

  async redpill(i: CommandInteraction, runner: Runner) {
    const member = i.member as GuildMember;

    if (member.roles.cache.has(Config.roleId("DEGEN"))) {
      await i.reply("What.. Again?");
      return;
    }

    i.reply("`REDPILL_TAKEN`");
    const user = await getUser(member.id);
    await OnboardController.partThree(
      user!,
      runner.get("ADMIN"),
      runner.get("ALLY")
    );
  }

  async help(i: CommandInteraction, runner: Runner) {
    const ally = runner.get("ALLY");
    const channel = i.channel as TextBasedChannel;

    const [member, apartmentUser, cell] = await Promise.all([
      ally.getMember(i.user.id),
      getUserByApartment(channel.id),
      getCellByChannelId(channel.id),
    ]);

    const isApartment = apartmentUser !== null;
    const isCell = cell !== null;

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
          cell={cell}
          apartmentUser={apartmentUser}
        />
      ),
      ephemeral: true,
    });

    const user = await getUser(member.id);

    if (!user!.achievements.includes(Achievement.HELP_REQUESTED)) {
      await OnboardController.partFive(
        user!,
        runner.get("ADMIN"),
        runner.get("ALLY")
      );
    }

    // this.emit("WORLD_EVENT", {
    //   event: "HELP_REQUESTED",
    //   data: { member, channel: i.channel as TextBasedChannel },
    // });
  }

  async stats(i: CommandInteraction, runner: Runner) {
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

    if (!user.achievements.includes(Achievement.STATS_CHECKED)) {
      await OnboardController.partFour(
        user!,
        runner.get("ADMIN"),
        runner.get("ALLY")
      );
    }

    // this.emit("WORLD_EVENT", {
    //   event: "STATS_CHECKED",
    //   data: {
    //     member: i.member as GuildMember,
    //     checkee: ownStats ? null : member,
    //   },
    // });
  }

  async leaderboard(i: CommandInteraction, runner: Runner) {
    const show = i.options.getBoolean("post");
    const num = i.options.getNumber("top");

    const leaders = await getLeaders(num || 30);

    const m = makeLeaderboardEmbed(leaders);
    await i.reply({ embeds: [m], ephemeral: !show });
  }

  async inventory(i: CommandInteraction, runner: Runner) {
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

  async handleFoodSelect(i: SelectMenuInteraction, runner: Runner) {
    const items = await getMartItems();
    const res = await eatItem(i.values[0], i.user.id);

    const item = items.find((item) => item.id === i.values[0])!;

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
