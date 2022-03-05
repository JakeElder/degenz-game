import { GuildMember } from "discord.js";
import Config from "config";
import { paramCase } from "change-case";
import { userMention } from "@discordjs/builders";
import { DistrictSymbol, TenancyType } from "data/types";
import Events from "../Events";
import { District, Tenancy, User } from "data/db";
import Utils from "../Utils";
import {
  getAvailableCellNumber,
  getTenanciesInDistrict,
  getUser,
} from "../legacy/db";
import { Global } from "../Global";
import WaitingRoomController from "./WaitingRoomController";
import WelcomeRoomController from "./WelcomeRoomController";

export default class UserController {
  static async add(member: GuildMember) {
    const user = User.create({
      discordId: member.id,
      displayName: member.displayName,
    });
    await user.save();
    return user;
  }

  static async init(
    memberId: GuildMember["id"],
    onboard: boolean = true,
    districtSymbol: DistrictSymbol
  ) {
    const admin = Global.bot("ADMIN");

    let [member, user] = await Promise.all([
      admin.getMember(memberId),
      User.findOne({ where: { discordId: memberId } }),
    ]);

    if (member === null) {
      return { success: false, code: "MEMBER_NOT_FOUND" };
    }

    if (typeof user === "undefined") {
      [user] = await Promise.all([
        this.add(member),
        member.roles.add(Config.roleId("VERIFIED")),
      ]);
    }

    if (districtSymbol === null) {
      return { success: false, code: "ENTRY_CLOSED" };
    }

    const tenancies = await getTenanciesInDistrict(districtSymbol);

    if (tenancies >= Config.general("DISTRICT_CAPACITY")) {
      return { success: false, code: "DISTRICT_FULL" };
    }

    const parent = Config.categoryId(`THE_${districtSymbol}`);

    const apartment = await admin.guild.channels.create(
      `\u2302\uFF5C${paramCase(member!.displayName)}s-apartment`,
      {
        type: "GUILD_TEXT",
        parent,
        permissionOverwrites: [
          {
            id: Config.roleId("EVERYONE"),
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: member!.id,
            allow: ["VIEW_CHANNEL"],
          },
          {
            id: Config.roleId(onboard ? "BIG_BROTHER_BOT" : "ALLY_BOT"),
            allow: ["VIEW_CHANNEL"],
          },
        ],
      }
    );

    const district = await District.findOneOrFail({
      where: { symbol: districtSymbol },
    });

    user.gbt = onboard ? 0 : 100;
    user.inGame = true;
    user.tenancies = [
      Tenancy.create({
        discordChannelId: apartment.id,
        type: TenancyType.AUTHORITY,
        district,
      }),
    ];

    await user.save();

    await Promise.all([
      WaitingRoomController.update(),
      WelcomeRoomController.updateWelcomeMessage(),
    ]);

    Events.emit("APARTMENT_ALLOCATED", { user, onboard });

    return { success: true, code: "USER_INITIATED", user };
  }

  static async eject(memberId: GuildMember["id"]) {
    const admin = Global.bot("ADMIN");

    const user = await getUser(memberId);
    const member = await admin.getMember(memberId);

    // Check user exists in db
    if (user === null) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    // Remove apartment
    try {
      const tenancy = user.primaryTenancy;
      const apartment = await admin.getTextChannel(tenancy.discordChannelId);
      await apartment.delete();
    } catch (e) {
      // this.error(e);
    }

    // Remove roles
    await member!.roles.remove([
      Config.roleId("DEGEN"),
      Config.roleId("PRISONER"),
      Config.roleId("VERIFIED"),
    ]);

    // Remove from db
    await User.remove(user);

    WaitingRoomController.update();
    WelcomeRoomController.updateWelcomeMessage();

    return { success: true, code: "USER_EJECTED" };
  }

  static async imprison(memberId: GuildMember["id"]) {
    const admin = Global.bot("ADMIN");

    const member = await admin.getMember(memberId);
    const user = await getUser(member!.id);

    if (user === null) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    const entryRoleIds = member!.roles.cache
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
            id: member!.id,
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
      member!.roles.remove(entryRoleIds),
    ]);

    await member!.roles.add(Config.roleId("PRISONER"));

    Utils.delay(1000);

    UserController.onboardPrisoner(user);

    return { success: true, code: "USER_IMPRISONED" };
  }

  static async onboardPrisoner(user: User) {
    const prisoner = Global.bot("PRISONER");

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

  static async release(memberId: GuildMember["id"]) {
    const admin = Global.bot("ADMIN");

    const member = await admin.getMember(memberId);
    const user = await getUser(member!.id);

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
      apartment.permissionOverwrites.create(member!.id, { VIEW_CHANNEL: true }),
      community.permissionOverwrites.create(member!.id, { VIEW_CHANNEL: null }),
      member!.roles.add(user.imprisonment.entryRoleIds),
    ]);

    await member!.roles.remove(Config.roleId("PRISONER"));

    const cellChannel = await admin.getTextChannel(
      user.imprisonment.cellDiscordChannelId
    );
    await cellChannel.delete();
    await user.imprisonment.softRemove();

    return { success: true, code: "USER_RELEASED" };
  }

  static async openWorld(user: User) {
    const admin = Global.bot("ADMIN");

    const member = await admin.getMember(user.discordId);
    await member!.roles.add(Config.roleId("DEGEN"));
    await member!.roles.remove(Config.roleId("VERIFIED"));
  }
}
