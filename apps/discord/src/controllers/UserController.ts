import { GuildMember } from "discord.js";
import Config from "app-config";
import { paramCase } from "change-case";
import { userMention } from "@discordjs/builders";
import { DistrictId } from "types";
import { User } from "db";
import Events from "../Events";
import AdminBot from "../bots/AdminBot";
import Utils from "../Utils";
import {
  addUser,
  deleteUser,
  getAvailableCellNumber,
  getOpenDistrict,
  getTenanciesInDistrict,
  getUser,
} from "../legacy/db";
import WaitingRoomController from "./WaitingRoomController";
import { PrisonerBot } from "../bots";

export default class UserController {
  static async init(
    memberId: GuildMember["id"],
    onboard: boolean = true,
    district: DistrictId | null,
    bot: AdminBot
  ) {
    let [member, user] = await Promise.all([
      bot.getMember(memberId),
      User.findOne({ where: { discordId: memberId } }),
    ]);

    let publicDistrict = false;

    if (!district) {
      publicDistrict = true;
      district = await getOpenDistrict();
    }

    if (typeof user !== "undefined") {
      return { success: false, code: "ALREADY_INITIATED" };
    }

    if (district === null) {
      return { success: false, code: "ENTRY_CLOSED" };
    }

    const tenancies = await getTenanciesInDistrict(district);

    if (tenancies >= Config.general("DISTRICT_CAPACITY")) {
      return { success: false, code: "DISTRICT_FULL" };
    }

    const parent = Config.categoryId(`THE_${district}`);

    const apartment = await bot.guild.channels.create(
      `\u2302\uFF5C${paramCase(member.displayName)}s-apartment`,
      {
        type: "GUILD_TEXT",
        parent,
        permissionOverwrites: [
          {
            id: Config.roleId("EVERYONE"),
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: member.id,
            allow: ["VIEW_CHANNEL"],
          },
          {
            id: Config.roleId(onboard ? "BIG_BROTHER_BOT" : "ALLY_BOT"),
            allow: ["VIEW_CHANNEL"],
          },
        ],
      }
    );

    user = await addUser({
      member,
      apartmentId: apartment.id,
      districtId: district,
      tokens: onboard ? 0 : 100,
    });

    if (user === null) {
      await apartment.delete();
      return { success: false, code: "USER_NOT_ADDED_DB" };
    }

    Events.emit("APARTMENT_ALLOCATED", { user, onboard });

    if (
      publicDistrict &&
      tenancies + 1 === Config.general("DISTRICT_CAPACITY")
    ) {
      WaitingRoomController.setStatus(false, bot);
    }

    return { success: true, code: "USER_INITIATED", user };
  }

  static async eject(memberId: GuildMember["id"], bot: AdminBot) {
    const user = await getUser(memberId);
    const member = await bot.getMember(memberId);

    // Check user exists in db
    if (user === null) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    // Remove apartment
    try {
      const tenancy = user.primaryTenancy;
      const apartment = await bot.getTextChannel(tenancy.discordChannelId);
      await apartment.delete();
    } catch (e) {
      // this.error(e);
    }

    // Remove roles
    await member.roles.remove([
      Config.roleId("DEGEN"),
      Config.roleId("PRISONER"),
      Config.roleId("VERIFIED"),
    ]);

    // Delete from db
    await deleteUser(member);

    (async () => {
      const district = await getOpenDistrict();
      const newTenancy = user.primaryTenancy;
      if (district === newTenancy.district) {
        const tenancies = await getTenanciesInDistrict(district);
        if (tenancies < Config.general("DISTRICT_CAPACITY")) {
          WaitingRoomController.setStatus(true, bot);
        }
      }
    })();

    return { success: true, code: "USER_EJECTED" };
  }

  static async imprison(
    memberId: GuildMember["id"],
    admin: AdminBot,
    prisoner: PrisonerBot
  ) {
    const member = await admin.getMember(memberId);
    const user = await getUser(member.id);

    if (user === null) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    const entryRoleIds = member.roles.cache
      .map((r) => r.id)
      .filter(
        (i) =>
          i !== Config.roleId("VERIFIED") &&
          i !== Config.roleId("SERVER_BOOSTER")
      );

    const number = await getAvailableCellNumber();

    const cell = await admin.guild.channels.create(
      `\u25A8\uFF5Ccell-${number.toString().padStart(2, "0")}`,
      {
        type: "GUILD_TEXT",
        parent: Config.categoryId("PRISON"),
        permissionOverwrites: [
          {
            id: Config.roleId("EVERYONE"),
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: Config.roleId("WARDEN_BOT"),
            allow: ["VIEW_CHANNEL"],
          },
          {
            id: Config.roleId("PRISONER_BOT"),
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
          },
          {
            id: member.id,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      }
    );

    const primaryTenancy = user.primaryTenancy;
    const apartment = await admin.getTextChannel(
      primaryTenancy.discordChannelId
    );

    await Promise.all([
      user.imprison({
        cellDiscordChannelId: cell.id,
        cellNumber: number,
        entryRoleIds,
      }),
      apartment.permissionOverwrites.delete(user.discordId),
      member.roles.remove(entryRoleIds),
    ]);

    await member.roles.add(Config.roleId("PRISONER"));

    Utils.delay(1000);

    UserController.onboardPrisoner(user, prisoner);

    return { success: true, code: "USER_IMPRISONED" };
  }

  static async onboardPrisoner(user: User, prisoner: PrisonerBot) {
    const channel = await prisoner.getTextChannel(user.cellDiscordChannelId);
    await channel.send({
      embeds: [
        {
          image: {
            url: "https://s10.gifyu.com/images/Clue-Defense-Degenzd5deb9c10509fc47.gif",
          },
        },
      ],
    });

    await Utils.delay(1500);

    const member = userMention(user.discordId);
    await channel.send(
      `Tough break ${member}. I see they've thrown you in here too.`
    );

    await Utils.delay(1500);

    await channel.send(
      `Don't worry too much, I've heard the Warden can be bought off pretty cheap.`
    );

    await Utils.delay(1500);

    await channel.send(
      ` Try to offer him a bribe with the \`/bribe\` command. If you need help, try the \`/help\` command or ask someone in <#${Config.channelId(
        "GEN_POP"
      )}>`
    );
  }

  static async release(memberId: GuildMember["id"], admin: AdminBot) {
    const member = await admin.getMember(memberId);
    const user = await getUser(member.id);

    if (!user.imprisoned) {
      return { success: false, code: "NOT_IMPRISONED" };
    }

    const community = await admin.getTextChannel(
      Config.categoryId("COMMUNITY")
    );

    const apartment = await admin.getTextChannel(
      user.primaryTenancy.discordChannelId
    );

    await Promise.all([
      apartment.permissionOverwrites.create(member.id, { VIEW_CHANNEL: true }),
      community.permissionOverwrites.create(member.id, { VIEW_CHANNEL: null }),
      member.roles.add(user.imprisonment.entryRoleIds),
    ]);

    await member.roles.remove(Config.roleId("PRISONER"));

    const cellChannel = await admin.getTextChannel(
      user.imprisonment.cellDiscordChannelId
    );
    await cellChannel.delete();
    await user.imprisonment.softRemove();

    return { success: true, code: "USER_RELEASED" };
  }

  static async openWorld(user: User, admin: AdminBot) {
    const member = await admin.getMember(user.discordId);
    await member.roles.add(Config.roleId("DEGEN"));
    await member.roles.remove(Config.roleId("VERIFIED"));
  }
}
