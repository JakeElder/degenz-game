import React from "react";
import {
  CommandInteraction,
  GuildBasedChannel,
  GuildMember,
  TextBasedChannel,
} from "discord.js";
import { AppState, CampaignInvite, ENGAGEMENT_LEVELS, User } from "data/db";
import { Format } from "lib";
import pluralize from "pluralize";
import { ILike } from "typeorm";
import prettyjson from "prettyjson";
import { issueTokens } from "../legacy/db";
import UserController from "../controllers/UserController";
import { CommandController } from "../CommandController";
import { AchievementSymbol, DistrictSymbol, RoleSymbol } from "data/types";
import AppController from "../controllers/AppController";
import { Global } from "../Global";
import NextStepController from "../controllers/NextStepsController";
import Events from "../Events";
import Config from "config";
import EntranceController from "../controllers/EntranceController";
import Utils from "../Utils";
import { EngagementLevelNumber } from "data/src/entity/EngagementLevel";
import AchievementController from "../controllers/AchievementController";
import { UserMention } from "../legacy/templates";

export default class AllyCommandController extends CommandController {
  async respond(
    i: CommandInteraction,
    content: string,
    type: "SUCCESS" | "FAIL" | "NEUTRAL" = "NEUTRAL"
  ) {
    const prefix = {
      SUCCESS: "\u2705 ",
      FAIL: "\u26a0\ufe0f ",
      NEUTRAL: "",
    }[type];

    content = `${prefix}\`${content}\``;

    await (i.deferred || i.replied
      ? i.editReply({ content })
      : i.reply({ content, ephemeral: true }));
  }

  async admin_initiate(i: CommandInteraction) {
    await i.deferReply({ ephemeral: true });

    const onboard = i.options.getBoolean("onboard");
    const districtSymbol = i.options.getString("district") as DistrictSymbol;
    const member = i.options.getMember("member", true) as GuildMember;

    const result = await UserController.initApartment(
      member.id,
      onboard === null || onboard ? true : false,
      districtSymbol
    );

    return this.respond(i, result.code, result.success ? "SUCCESS" : "FAIL");
  }

  async admin_eject(i: CommandInteraction) {
    await i.deferReply({ ephemeral: true });

    const member = i.options.getMember("member", true) as GuildMember;
    const result = await UserController.eject(member.id);

    return this.respond(i, result.code, result.success ? "SUCCESS" : "FAIL");
  }

  async admin_send(i: CommandInteraction) {
    const message = i.options.getString("message", true);
    const as = i.options.getMember("as", true) as GuildMember;

    let channel = i.options.getChannel("channel") as GuildBasedChannel | null;

    if (!channel) {
      channel = i.channel as GuildBasedChannel;
    }

    const res = await AppController.sendMessageFromBot({
      as,
      channel,
      message,
    });

    return this.respond(
      i,
      res.success !== false ? "MESSAGE_SENT" : res.code,
      res.success ? "SUCCESS" : "FAIL"
    );
  }

  async admin_clear(i: CommandInteraction) {
    let channel = i.options.getChannel("channel");
    const number = i.options.getNumber("number");

    if (!channel) {
      channel = i.channel as GuildBasedChannel;
    }

    const c = await Utils.Channel.getOrFail(channel.id);

    try {
      await c.bulkDelete(number || 100);
      await this.respond(i, "CHANNEL_CLEARED", "SUCCESS");
    } catch (e) {
      await this.respond(i, "DISCORD_ERROR", "FAIL");
      console.error(e);
    }
  }

  async admin_confiscate(i: CommandInteraction) {
    const amount = i.options.getNumber("amount", true);
    const member = i.options.getUser("member", true);

    try {
      let user: User | null;
      if (member) {
        user = await User.findOne({
          where: { id: member.id },
        });
        if (!user || !user.inGame) {
          await this.respond(i, "USER_NOT_FOUND", "FAIL");
          return;
        }
        if (amount <= 0) {
          await this.respond(i, "INVALID_AMOUNT", "FAIL");
          return;
        }
        user.gbt -= amount;
        await user.save();

        Events.emit("TOKENS_CONFISCATED", {
          confiscaterId: i.user.id,
          user,
          amount,
        });
      }
    } catch (e) {
      await this.respond(i, "DIDNT_CONFISCATE_TOKENS", "FAIL");
      return;
    }

    await this.respond(i, "TOKENS_CONFISCATED", "SUCCESS");
  }

  async reward(i: CommandInteraction) {
    const amount = i.options.getNumber("amount", true);
    const member = i.options.getUser("member", true);

    let user: User | null;

    try {
      user = await User.findOne({
        where: { id: member.id },
      });

      if (!user || !user.inGame) {
        await this.respond(i, "USER_NOT_FOUND", "FAIL");
        return;
      }

      if (amount <= 0) {
        await this.respond(i, "INVALID_AMOUNT", "FAIL");
        return;
      }

      user.gbt += amount;
      await user.save();
    } catch (e) {
      await this.respond(i, "COULDNT_ISSUE_REWARD", "FAIL");
      return;
    }

    const c = await Utils.Channel.getOrFail(i.channelId, "ALLY");

    const m = await UserController.getMember(user.id);

    await c.send({
      embeds: [
        {
          color: "GOLD",
          description: Utils.r(
            <>
              <UserMention id={i.user.id} /> rewarded{" "}
              <UserMention id={user.id} /> with {Config.emojiCode("GBT_COIN")}{" "}
              **{amount}** 🎉
            </>
          ),
        },
        {
          author: {
            name: m.displayName,
            icon_url: m.displayAvatarURL(),
          },
          color: "DARK_GREEN",
          description: Utils.r(
            <>{Format.transaction(user.gbt - amount, amount)}</>
          ),
        },
      ],
    });

    await this.respond(i, "TOKENS_ISSUED", "SUCCESS");
  }

  async admin_issue(i: CommandInteraction) {
    const amount = i.options.getNumber("amount", true);
    const member = i.options.getUser("member");

    try {
      let user: User | null;
      if (member) {
        user = await User.findOne({
          where: { id: member.id },
        });
        if (!user || !user.inGame) {
          await this.respond(i, "USER_NOT_FOUND", "FAIL");
          return;
        }
        if (amount <= 0) {
          await this.respond(i, "INVALID_AMOUNT", "FAIL");
          return;
        }
        user.gbt += amount;
        await user.save();
        Events.emit("TOKENS_ISSUED", {
          issuerId: i.user.id,
          recipient: user || null,
          amount,
        });
      } else {
        await issueTokens(amount);
      }
    } catch (e) {
      await this.respond(i, "DIDNT_ISSUE_TOKENS", "FAIL");
      return;
    }

    await this.respond(i, "TOKENS_ISSUED", "SUCCESS");
  }

  async admin_open(i: CommandInteraction) {
    const districtSymbol = i.options.getString(
      "district",
      true
    ) as DistrictSymbol;

    try {
      await AppController.openDistrict(districtSymbol);
      await this.respond(i, `${districtSymbol}_OPENED`, "SUCCESS");
    } catch (e) {
      console.error(e);
      await this.respond(i, "DIDNT_SET_DISTRICT", "FAIL");
    }
  }

  async admin_close(i: CommandInteraction) {
    const districtSymbol = i.options.getString(
      "district",
      true
    ) as DistrictSymbol;
    try {
      await AppController.closeDistrict(districtSymbol);
      await this.respond(i, `${districtSymbol}_CLOSED`, "SUCCESS");
    } catch (e) {
      await this.respond(i, "ENTRY_DISABLE_FAILED", "FAIL");
    }
  }

  async admin_setEntryMessage(i: CommandInteraction) {
    EntranceController.update();
    await this.respond(i, "MESSAGE_SENT", "SUCCESS");
  }

  async admin_increaseDormCapacity(i: CommandInteraction) {
    const amount = i.options.getNumber("amount", true);
    if (amount > 50) {
      await this.respond(i, "50_MAXIMUM_EXCEEDED", "FAIL");
    }
    await AppState.increaseDormitoryCapacity(amount);
    EntranceController.update();
    await this.respond(i, `DORM_CAPACITY_INCREASED: +${amount}`, "SUCCESS");
  }

  async admin_test(i: CommandInteraction) {}

  async admin_openShelters(i: CommandInteraction) {
    await this.setSheltersOpenState(i, true);
  }

  async admin_closeShelters(i: CommandInteraction) {
    await this.setSheltersOpenState(i, false);
  }

  async admin_setNickname(i: CommandInteraction) {
    const member = i.options.getUser("member", true);
    const name = i.options.getString("name", true);
    // const user = await User.findOneOrFail({ where: { discordId: member.id } });

    const admin = Global.bot("ADMIN");

    const m = await admin.guild.members.fetch(member.id);
    await m.edit({ nick: name });
    this.respond(i, `NICK_SET`, "SUCCESS");
  }

  async awardAchievement(i: CommandInteraction) {
    const member = i.options.getUser("member", true);
    const achievement = i.options.getString(
      "achievement",
      true
    ) as AchievementSymbol;
    const user = await User.findOneOrFail({ where: { id: member.id } });

    if (user.hasAchievement(achievement)) {
      await this.respond(i, `ALREADY_AWARDED`, "FAIL");
      return;
    }

    await AchievementController.checkAndAward(user, achievement);
    this.respond(i, `${achievement} awarded to ${user.displayName}`, "SUCCESS");
  }

  async admin_sendNextSteps(i: CommandInteraction) {
    const member =
      i.options.getUser("member", false) || (i.member as GuildMember);
    const user = await User.findOneOrFail({ where: { id: member.id } });
    const ally = Global.bot("ALLY");
    const channel = await ally.guild.channels.fetch(i.channelId);
    await NextStepController.send(channel as TextBasedChannel, user);
    this.respond(i, `MESSAGE_SENT`, "SUCCESS");
  }

  async setSheltersOpenState(i: CommandInteraction, areOpen: boolean) {
    const state = await AppState.fetch();
    state.sheltersOpen = areOpen;
    await state.save();
    EntranceController.update();
    await this.respond(
      i,
      `SHELTERS_${areOpen ? "OPENED" : "CLOSED"}`,
      "SUCCESS"
    );
  }

  async admin_backfillEngagement(i: CommandInteraction) {
    await i.deferReply({ ephemeral: true });

    const users = await User.find();

    for (let i = 0; i < users.length; i++) {
      let level: EngagementLevelNumber | null = null;
      for (let ii = ENGAGEMENT_LEVELS.length - 1; ii >= 0; ii--) {
        if (users[i].hasAchievement(`LEVEL_${ENGAGEMENT_LEVELS[ii]}_REACHED`)) {
          if (!level) {
            level = ENGAGEMENT_LEVELS[ii];
          }
        }
        if (level && ENGAGEMENT_LEVELS[ii] < level) {
          await AchievementController.checkAndAward(
            users[i],
            `LEVEL_${ENGAGEMENT_LEVELS[ii]}_REACHED`
          );
        }
      }
    }

    await this.respond(i, `ENGAGEMENT_BACKFILLED`, "SUCCESS");
  }

  async whitelist(i: CommandInteraction) {
    const member = i.options.getMember("member", true) as GuildMember;
    const type = (i.options.getString("type") || "STANDARD") as
      | "STANDARD"
      | "OG";

    const user = await User.findOneByOrFail({ id: member.id });
    const walletSubmitted = !!user.walletAddress;

    const roles: {
      SUBMITTED: Record<typeof type, RoleSymbol>;
      NOT_SUBMITTED: Record<typeof type, RoleSymbol>;
    } = {
      SUBMITTED: {
        STANDARD: "WHITELIST_CONFIRMED",
        OG: "OG_WHITELIST_CONFIRMED",
      },
      NOT_SUBMITTED: {
        STANDARD: "WHITELIST",
        OG: "OG_WHITELIST",
      },
    };

    const roleId = roles[walletSubmitted ? "SUBMITTED" : "NOT_SUBMITTED"][type];

    if (member.roles.cache.has(Config.roleId(roleId))) {
      await this.respond(i, `ALREADY_WHITELISTED`, "FAIL");
      return;
    }

    await member.roles.add(Config.roleId(roleId));
    await this.respond(i, `WHITELIST_ASSIGNED`, "SUCCESS");
  }

  async admin_createInviteLink(i: CommandInteraction) {
    const admin = Global.bot("ADMIN");
    const campaign = i.options.getString("campaign", true) as DistrictSymbol;
    try {
      const invite = await admin.guild.invites.create(
        Config.channelId("ENTRANCE"),
        { unique: true, maxAge: 0 }
      );
      await CampaignInvite.insert({ campaign, discordCode: invite.code });
      await i.reply({ content: "`\u2705 SUCCESS`", ephemeral: true });
      await i.followUp({ content: invite.url, ephemeral: true });
    } catch (e) {
      await this.respond(i, "DISCORD_ERROR", "FAIL");
      console.error(e);
      await i.followUp({
        content: Format.codeBlock(JSON.stringify(e, null, 2)),
        ephemeral: true,
      });
    }
  }

  async admin_userSearch(i: CommandInteraction) {
    const query = i.options.getString("query", true);
    const users = await User.find({
      where: { displayName: ILike(`%${query}%`) },
      relations: ["apartmentTenancies", "dormitoryTenancy"],
    });

    await i.reply({
      content: `Found **${users.length} ${pluralize(
        "user",
        users.length
      )}** matching "**${query}**"`,
      ephemeral: true,
    });

    const interaction = i;

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const apartment = u.apartmentTenancies[0]
        ? prettyjson.render(
            { district: u.apartmentTenancies[0].district.id },
            { noColor: true }
          )
        : "--none--";

      const dormitory = u.dormitoryTenancy
        ? prettyjson.render(
            { dorm: u.dormitoryTenancy.dormitory.id },
            { noColor: true }
          )
        : "--none--";

      await interaction.followUp({
        embeds: [
          {
            author: {
              name: u.displayName,
            },
            fields: [
              { name: "GBT", value: Format.codeBlock(u.gbt) },
              { name: "Apartment", value: Format.codeBlock(apartment) },
              { name: "Dormitory", value: Format.codeBlock(dormitory) },
            ],
          },
        ],
        ephemeral: true,
      });
    }
  }
}
