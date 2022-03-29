import { GuildMember } from "discord.js";
import Config from "config";
import { paramCase } from "change-case";
import { userMention } from "@discordjs/builders";
import {
  DistrictSymbol,
  ApartmentTenancyLevelEnum,
  Achievement as AchievementEnum,
} from "data/types";
import Events from "../Events";
import {
  District,
  ApartmentTenancy,
  User,
  Dormitory,
  DormitoryTenancy,
  Role,
  Achievement,
  Imprisonment,
} from "data/db";
import Utils from "../Utils";
import { getAvailableCellNumber, getTenanciesInDistrict } from "../legacy/db";
import { Global } from "../Global";
import EnterTheProjectsController from "./EnterTheProjectsController";
import EnterTheSheltersController from "./EnterTheSheltersController";
import random from "random";

type FailedApartmentInitResult = {
  success: false;
  code: string;
};

type SuccessfulApartmentInitResult = {
  success: true;
  code: string;
  user: User;
};

type ApartmentInitResult =
  | SuccessfulApartmentInitResult
  | FailedApartmentInitResult;

export default class UserController {
  static async add(member: GuildMember) {
    const user = User.create({
      discordId: member.id,
      displayName: member.displayName,
    });
    await user.save();
    return user;
  }

  static async initApartment(
    memberId: GuildMember["id"],
    onboard: boolean = true,
    districtSymbol: DistrictSymbol
  ): Promise<ApartmentInitResult> {
    let [member, user] = await Promise.all([
      UserController.getMember(memberId),
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

    const apartmentTenancies = await getTenanciesInDistrict(districtSymbol);

    if (apartmentTenancies >= Config.general("DISTRICT_CAPACITY")) {
      return { success: false, code: "DISTRICT_FULL" };
    }

    const parent = Config.categoryId(`THE_${districtSymbol}`);
    const admin = Global.bot("ADMIN");

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
    user.strength = 100;
    user.inGame = true;
    user.apartmentTenancies = [
      ApartmentTenancy.create({
        discordChannelId: apartment.id,
        level: ApartmentTenancyLevelEnum.AUTHORITY,
        district,
      }),
    ];

    const role = await Role.findOneOrFail({
      where: { symbol: district.citizenRoleSymbol },
    });
    await Promise.all([user.save(), member.roles.add(role.discordId)]);

    await user.save();

    EnterTheProjectsController.update();

    Events.emit("APARTMENT_ALLOCATED", { user, onboard });

    return { success: true, code: "USER_INITIATED", user };
  }

  static async initShelters(
    memberId: GuildMember["id"],
    onboard: boolean = true
  ) {
    let [member, user] = await Promise.all([
      UserController.getMember(memberId),
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

    const dormitory = await Dormitory.choose();

    if (dormitory === null) {
      return { success: false, code: "THE_SHELTERS_FULL" };
    }

    const dormId = Config.channelId(dormitory.symbol);
    const bb = Global.bot("BIG_BROTHER");
    const admin = Global.bot("ADMIN");

    const dormChannelBB = await bb.getTextChannel(dormId);
    const dormChannelAdmin = await admin.getTextChannel(dormId);

    await Promise.all([
      dormChannelAdmin.permissionOverwrites.create(member, {
        VIEW_CHANNEL: true,
      }),
    ]);

    const thread = await dormChannelBB.threads.create({
      name: `\u2331\uFF5C${paramCase(member!.displayName)}s-orientation`,
      invitable: false,
      autoArchiveDuration: 1440,
      type: ["production"].includes(Config.env("NODE_ENV"))
        ? "GUILD_PRIVATE_THREAD"
        : "GUILD_PUBLIC_THREAD",
    });

    user.gbt = onboard ? 0 : 100;
    user.strength = 100;
    user.inGame = true;
    user.dormitoryTenancy = DormitoryTenancy.create({
      dormitory,
      onboardingThreadId: thread.id,
    });

    const role = await Role.findOneOrFail({
      where: { symbol: dormitory.citizenRoleSymbol },
    });

    await Promise.all([user.save(), member.roles.add(role.discordId)]);

    EnterTheSheltersController.update();

    Events.emit("DORMITORY_ALLOCATED", { user, onboard });

    return { success: true, code: "USER_INITIATED", user };
  }

  static getCachedMember(id: GuildMember["id"]) {
    const bots = Global.bots();

    let i = 0;
    while (i < bots.length) {
      const member = bots[i].guild.members.cache.get(id);
      if (member) {
        return member;
      }
      i++;
    }

    return null;
  }

  static async getMember(id: GuildMember["id"]) {
    const bots = Global.bots();
    await Promise.all(bots.map((b) => b.ready));

    let member = this.getCachedMember(id);

    if (member) {
      return member;
    }

    return bots
      .find((b) => b.manifest.symbol === "ADMIN")!
      .guild.members.fetch(id);
  }

  static async getMembers(ids: GuildMember["id"][]) {
    let members: (GuildMember | null)[] = ids.map(() => null);
    const bots = Global.bots();

    await Promise.all(bots.map((b) => b.ready));

    // Check cache
    members = members.map((m, idx) => m ?? this.getCachedMember(ids[idx]));

    // Return if we found them all
    if (!members.some((m) => m === null)) {
      return members;
    }

    // If not hit API
    const remaining = await bots
      .find((b) => b.manifest.symbol === "ADMIN")!
      .guild.members.fetch({
        user: ids.filter(
          (id) => !members.some((m) => m !== null && m.id === id)
        ),
      });

    // And fill in remaining
    members = members.map(
      (m, idx) => m ?? remaining.find((m) => m.id === ids[idx]) ?? null
    );

    return members;
  }

  static async eject(memberId: GuildMember["id"]) {
    const admin = Global.bot("ADMIN");
    const user = await User.findOne({
      where: { discordId: memberId },
      relations: [
        "apartmentTenancies",
        "dormitoryTenancy",
        "imprisonments",
        "achievements",
        "martItemOwnerships",
      ],
    });

    // Check user exists in db
    if (!user) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    // Remove apartment
    try {
      const tenancy = user.primaryTenancy;
      if (tenancy.type === "APARTMENT") {
        const apartment = await admin.getTextChannel(tenancy.discordChannelId);
        await apartment.delete();
      }
    } catch (e) {
      // console.error(e)
    }

    // Remove dorm tenancy
    try {
      const tenancy = user.dormitoryTenancy;

      if (tenancy) {
        const { onboardingThreadId } = tenancy;
        const discordChannelId = tenancy.dormitory.discordChannelId;
        const dormChannel = await admin.getTextChannel(discordChannelId);
        const thread = await dormChannel.threads.fetch(onboardingThreadId!);

        try {
          thread!.delete();
        } catch (e) {}

        try {
          dormChannel.permissionOverwrites.delete(user.discordId);
        } catch (e) {}

        await tenancy.remove();
      }
    } catch (e) {
      console.error(e);
    }

    // Remove roles
    try {
      const member = await UserController.getMember(memberId);
      await member.roles.remove(member.roles.valueOf());
    } catch (e) {
      // console.error(e);
    }

    // Remove from db
    await User.remove(user);

    // Update entry persistent messages
    EnterTheProjectsController.update();
    EnterTheSheltersController.update();

    return { success: true, code: "USER_EJECTED" };
  }

  static async imprison(
    captorId: GuildMember["id"],
    prisonerId: GuildMember["id"],
    reason: string
  ) {
    const admin = Global.bot("ADMIN");
    const member = await UserController.getMember(prisonerId);

    const [captor, prisoner] = await Promise.all([
      User.findOne({ where: { discordId: captorId } }),
      User.findOne({
        where: { discordId: prisonerId },
        relations: [
          "apartmentTenancies",
          "dormitoryTenancy",
          "imprisonments",
          "achievements",
        ],
      }),
    ]);

    const imprisonments = await Imprisonment.count();

    if (imprisonments >= 40) {
      return { success: false, code: "CAPACITY_REACHED" };
    }

    if (!captor || !prisoner) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    if (prisoner.hasAchievement(AchievementEnum.JOINED_THE_DEGENZ)) {
      return { success: false, code: "USER_NOT_REDPILLED" };
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
            id: Config.roleId("THOUGHT_POLICE"),
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

    const releaseCode = `${random.int(0, 9999)}`.padEnd(4, "0");

    await Promise.all([
      prisoner.imprison({
        cellDiscordChannelId: cell.id,
        cellNumber: number,
        entryRoleIds,
        releaseCode,
        reason,
      }),
      this.hideResidencies(prisoner),
      member!.roles.remove(entryRoleIds),
    ]);

    await member!.roles.add(Config.roleId("PRISONER"));

    Utils.delay(1000);

    UserController.onboardPrisoner(prisoner);

    Events.emit("CITIZEN_IMPRISONED", { captor, prisoner, reason });

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

  static async hideResidencies(user: User) {
    const admin = Global.bot("ADMIN");
    if (user.primaryTenancy.type === "APARTMENT") {
      const residence = await admin.getTextChannel(
        user.primaryTenancy.discordChannelId
      );
      residence.permissionOverwrites.delete(user.discordId);
    }
  }

  static async showResidencies(user: User) {
    const admin = Global.bot("ADMIN");
    if (user.primaryTenancy.type === "APARTMENT") {
      const residence = await admin.getTextChannel(
        user.primaryTenancy.discordChannelId
      );
      residence.permissionOverwrites.create(user.discordId, {
        VIEW_CHANNEL: true,
      });
    }
  }

  static async release(
    prisonerId: GuildMember["id"],
    captorId: GuildMember["id"] | null,
    type: "ESCAPE" | "RELEASE"
  ) {
    const admin = Global.bot("ADMIN");
    const member = await UserController.getMember(prisonerId);
    const [captor, prisoner] = await Promise.all([
      User.findOne({ where: { discordId: captorId } }),
      User.findOne({
        where: { discordId: prisonerId },
        relations: ["apartmentTenancies", "dormitoryTenancy", "imprisonments"],
      }),
    ]);

    if (!prisoner) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    if (!member) {
      throw new Error("Member not found");
    }

    if (!prisoner.imprisoned) {
      return { success: false, code: "NOT_IMPRISONED" };
    }

    await Promise.all([
      this.showResidencies(prisoner),
      member.roles.add(prisoner.imprisonment.entryRoleIds),
    ]);

    const { imprisonment } = prisoner;

    await member.roles.remove(Config.roleId("PRISONER"));
    const cell = await admin.getTextChannel(imprisonment.cellDiscordChannelId);
    await Promise.all([cell.delete(), imprisonment.softRemove()]);

    if (type === "ESCAPE") {
      Events.emit("CITIZEN_ESCAPED", { prisoner });
    } else {
      Events.emit("CITIZEN_RELEASED", { captor: captor!, prisoner });
    }

    return { success: true, code: "USER_RELEASED" };
  }

  static async openWorld(user: User) {
    const member = await UserController.getMember(user.discordId);
    await member!.roles.add(Config.roleId("DEGEN"));
    await member!.roles.remove(Config.roleId("VERIFIED"));
    const admin = Global.bot("ADMIN");

    if (user.primaryTenancy.type === "DORMITORY") {
      const dormChannel = await admin.getTextChannel(
        user.primaryTenancy.dormitory.discordChannelId
      );
      await dormChannel.permissionOverwrites.delete(user.discordId);
    }
  }
}
