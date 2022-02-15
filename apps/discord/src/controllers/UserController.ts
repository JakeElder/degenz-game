import { GuildMember } from "discord.js";
import Config from "app-config";
import { paramCase } from "change-case";
import Events from "../Events";
import AdminBot from "../bots/AdminBot";
import Utils from "../Utils";
import {
  addUser,
  createCell,
  deleteCell,
  deleteUser,
  getCell,
  getDistrict,
  getTenanciesInDistrict,
  getUser,
  updateCellChannelId,
} from "../legacy/db";
import { Tenancy } from "../legacy/types";
import WaitingRoomController from "./WaitingRoomController";

export default class UserController {
  static async init(
    memberId: GuildMember["id"],
    onboard: boolean = true,
    district: Tenancy["district"] | null = null,
    bot: AdminBot
  ) {
    let [member, user] = await Promise.all([
      bot.getMember(memberId),
      getUser(memberId),
    ]);

    let publicDistrict = false;

    if (!district) {
      publicDistrict = true;
      district = await getDistrict();
    }

    if (user !== null) {
      return { success: false, code: "ALREADY_INITIATED" };
    }

    if (district === null) {
      return { success: false, code: "ENTRY_CLOSED" };
    }

    const tenancies = await getTenanciesInDistrict(district);

    if (tenancies >= Config.general("DISTRICT_CAPACITY")) {
      return { success: false, code: "DISTRICT_FULL" };
    }

    const districtId = [
      Config.categoryId("THE_PROJECTS_D1"),
      Config.categoryId("THE_PROJECTS_D2"),
      Config.categoryId("THE_PROJECTS_D3"),
      Config.categoryId("THE_PROJECTS_D4"),
      Config.categoryId("THE_PROJECTS_D5"),
      Config.categoryId("THE_PROJECTS_D6"),
    ][district - 1];

    const apartment = await bot.guild.channels.create(
      `\u2302\uFF5C${paramCase(member.displayName)}s-apartment`,
      {
        type: "GUILD_TEXT",
        parent: districtId,
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
      district,
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
      const apartment = await bot.getTextChannel(user.tenancies![0].propertyId);
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
      const district = await getDistrict();
      if (district === user.tenancies![0].district) {
        const tenancies = await getTenanciesInDistrict(district);
        if (tenancies < Config.general("DISTRICT_CAPACITY")) {
          WaitingRoomController.setStatus(true, bot);
        }
      }
    })();

    return { success: true, code: "USER_EJECTED" };
  }

  static async imprison(memberId: GuildMember["id"], bot: AdminBot) {
    const member = await bot.getMember(memberId);
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

    const { number } = (await createCell(member.id, entryRoleIds))!;

    const cell = await bot.guild.channels.create(
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

    await updateCellChannelId(member.id, cell.id);

    const apartment = await bot.getTextChannel(user.tenancies![0].propertyId);

    await Promise.all([
      apartment.permissionOverwrites.delete(user.id),
      member.roles.remove(entryRoleIds),
    ]);

    await member.roles.add(Config.roleId("PRISONER"));

    Utils.delay(1000);

    // this.emit("MEMBER_IMPRISIONED", { member, cell, user });

    return { success: true, code: "USER_IMPRISONED" };
  }

  static async release(memberId: GuildMember["id"], bot: AdminBot) {
    const member = await bot.getMember(memberId);
    const cell = await getCell(memberId);
    const user = await getUser(member.id);

    if (user === null) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    if (cell === null) {
      return { success: false, code: "CELL_NOT_FOUND" };
    }

    const community = await bot.getTextChannel(Config.categoryId("COMMUNITY"));
    const apartment = await bot.getTextChannel(user.tenancies![0].propertyId);

    await Promise.all([
      apartment.permissionOverwrites.create(member.id, { VIEW_CHANNEL: true }),
      community.permissionOverwrites.create(user.id, {
        VIEW_CHANNEL: null,
      }),
      member.roles.add(cell.entryRoleIds),
    ]);

    await member.roles.remove(Config.roleId("PRISONER"));

    const cellChannel = await bot.getTextChannel(cell.cellId!);
    await cellChannel.delete();
    await deleteCell(cell.userId);

    return { success: true, code: "USER_RELEASED" };
  }
}
