import { GuildMember } from "discord.js";
import Config from "config";
import { paramCase } from "change-case";
import { userMention } from "@discordjs/builders";
import { DistrictSymbol } from "data/types";
import Events from "../Events";
import {
  District,
  ApartmentTenancy,
  User,
  Dormitory,
  DormitoryTenancy,
  Imprisonment,
  DiscordChannel,
} from "data/db";
import Utils from "../Utils";
import { getAvailableCellNumber, getTenanciesInDistrict } from "../legacy/db";
import { Global } from "../Global";
import random from "random";
import EntranceController from "./EntranceController";
import QuestLogController from "./QuestLogController";
import OnboardController from "./OnboardController";

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
  static init() {
    this.bindEventListeners();
  }

  static bindEventListeners() {
    Events.on("QUEST_COMPLETED", async (e) => {
      const member = await this.getMember(e.data.user.id);
      if (member.roles.cache.has(Config.roleId("PREGEN"))) {
        await member.roles.add(Config.roleId("DEGEN"));
        await member.roles.remove(Config.roleId("PREGEN"));
      }
    });
  }

  static async add(member: GuildMember) {
    const user = User.create({
      id: member.id,
      discordId: member.id,
      displayName: member.displayName,
      apartmentTenancies: [],
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
      User.findOne({ where: { id: memberId } }),
    ]);

    if (member === null) {
      return { success: false, code: "MEMBER_NOT_FOUND" };
    }

    if (user === null) {
      [user] = await Promise.all([
        this.add(member),
        member.roles.add(Config.roleId("PREGEN")),
      ]);
    }

    if (districtSymbol === null) {
      return { success: false, code: "ENTRY_CLOSED" };
    }

    const apartmentTenancies = await getTenanciesInDistrict(districtSymbol);

    if (apartmentTenancies >= Config.general("DISTRICT_CAPACITY")) {
      return { success: false, code: "DISTRICT_FULL" };
    }

    const parent = Config.categoryId(`THE_PROJECTS_${districtSymbol}`);
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
      where: { id: districtSymbol },
    });

    user.gbt = onboard ? 0 : 100;
    user.strength = 100;
    user.inGame = true;
    user.apartmentTenancies = [
      ApartmentTenancy.create({
        discordChannelId: apartment.id,
        level: "AUTHORITY",
        district,
      }),
    ];

    await Promise.all([
      user.save(),
      member.roles.add(district.citizenRole.discordId),
    ]);

    EntranceController.update();
    Events.emit("APARTMENT_ALLOCATED", { user, onboard });

    return { success: true, code: "USER_INITIATED", user };
  }

  static async initShelters(
    memberId: GuildMember["id"],
    onboard: boolean = true
  ) {
    let [member, user] = await Promise.all([
      UserController.getMember(memberId),
      User.findOne({ where: { id: memberId } }),
    ]);

    if (member === null) {
      return { success: false, code: "MEMBER_NOT_FOUND" };
    }

    if (user === null) {
      [user] = await Promise.all([
        this.add(member),
        member.roles.add(Config.roleId("PREGEN")),
      ]);
    }

    const dormitory = await Dormitory.choose();

    if (dormitory === null) {
      return { success: false, code: "THE_SHELTERS_FULL" };
    }

    user.gbt = onboard ? 0 : 100;
    user.strength = 100;
    user.inGame = true;

    user.dormitoryTenancy = DormitoryTenancy.create({ dormitory });

    await Promise.all([
      user.save(),
      member.roles.add(dormitory.citizenRole.discordId),
    ]);

    await OnboardController.start(user);

    EntranceController.update();
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

    return bots.find((b) => b.npc.id === "ADMIN")!.guild.members.fetch(id);
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
      .find((b) => b.npc.id === "ADMIN")!
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
      where: { id: memberId },
      relations: [
        "apartmentTenancies",
        "dormitoryTenancy",
        "imprisonments",
        "achievements",
        "martItemOwnerships",
        "onboardingChannel",
        "onboardingChannel.discordChannel",
        "questLogChannel",
        "questLogChannel.discordChannel",
      ],
    });

    // Check user exists in db
    if (!user) {
      try {
        const member = await UserController.getMember(memberId);
        await member.roles.remove(member.roles.valueOf());
      } catch (e) {
        // console.error(e);
      }
      return { success: false, code: "USER_NOT_FOUND" };
    }

    // Remove quest log stuff
    if (user.questLogChannel) {
      try {
        const thread = await Utils.Thread.get(
          user.questLogChannel.discordChannel.id
        );
        if (thread) {
          await QuestLogController.purge(thread);
        } else {
          await user.questLogChannel.remove();
          await user.questLogChannel.discordChannel.remove();
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Remove onboarding channel
    if (user.onboardingChannel) {
      try {
        const thread = await Utils.Thread.get(
          user.onboardingChannel.discordChannel.id
        );
        if (thread) {
          await OnboardController.purge(thread);
        } else {
          await user.onboardingChannel.remove();
          await user.onboardingChannel.discordChannel.remove();
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Remove apartment
    try {
      const tenancy = user.primaryTenancy;
      if (tenancy.type === "APARTMENT") {
        const apartment = await admin.getTextChannel(tenancy.discordChannelId);
        await apartment.delete();
      }
    } catch (e) {
      console.error(e);
    }

    // Remove dorm tenancy
    try {
      const tenancy = user.dormitoryTenancy;

      if (tenancy) {
        const discordChannelId = tenancy.dormitory.channel.discordChannel.id;
        const dormChannel = await admin.getTextChannel(discordChannelId);

        try {
          dormChannel.permissionOverwrites.delete(user.id);
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
    EntranceController.update();

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
      User.findOne({ where: { id: captorId } }),
      User.findOne({
        where: { id: prisonerId },
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

    if (!prisoner.hasAchievement("JOIN_THE_DEGENZ_QUEST_COMPLETED")) {
      return { success: false, code: "USER_NOT_REDPILLED" };
    }

    if (prisoner.imprisoned) {
      return { success: false, code: "USER_ALREADY_IMPRISONED" };
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
        discordChannel: DiscordChannel.create({ id: cell.id }),
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

    const member = userMention(user.id);
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
      residence.permissionOverwrites.delete(user.id);
    }
  }

  static async showResidencies(user: User) {
    const admin = Global.bot("ADMIN");
    if (user.primaryTenancy.type === "APARTMENT") {
      const residence = await admin.getTextChannel(
        user.primaryTenancy.discordChannelId
      );
      residence.permissionOverwrites.create(user.id, {
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
      User.findOne({ where: { id: captorId! } }),
      User.findOne({
        where: { id: prisonerId },
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
    const cell = await admin.getTextChannel(imprisonment.discordChannel.id);
    await Promise.all([cell.delete(), imprisonment.softRemove()]);

    if (type === "ESCAPE") {
      Events.emit("CITIZEN_ESCAPED", { prisoner });
    } else {
      Events.emit("CITIZEN_RELEASED", { captor: captor!, prisoner });
    }

    return { success: true, code: "USER_RELEASED" };
  }
}
