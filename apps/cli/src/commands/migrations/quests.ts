// @ts-nocheck
import { Command } from "../../lib";
import {
  Achievement,
  ApartmentTenancy,
  CampaignInvite,
  District,
  Dormitory,
  DormitoryTenancy,
  // Invite,
  MartItem,
  MartItemOwnership,
  PlayerEvent,
  Pledge,
  User,
} from "data/db";
import * as Legacy from "legacy-data/db";
import { Achievement as AchievementEnum } from "legacy-data/types";
import Config from "config";
import { json } from "../../utils";

export default class MigrateQuests extends Command {
  static description = "Migrate to Quests system structure";

  async run(): Promise<void> {
    await Legacy.connect();

    // await this.users();
    // console.log("✅ Users");

    // await this.campaignInvites();
    // console.log("✅ CampaignInvites");

    // await this.invites();
    // console.log("✅ Invites");

    // console.log("\nMartItems...");
    // await this.martItems();
    // console.log("✅ MartItems");

    // console.log("\nDormitoryTenancies...");
    // await this.dormTenancies();
    // console.log("✅ DormitoryTenancies");

    // console.log("\nApartmentTenancies...");
    // await this.apartmentTenancies();
    // console.log("✅ ApartmentTenancies");

    // await this.pledges();
    // console.log("✅ Pledges");

    // await this.playerEvents();
    // console.log("✅ PlayerEvents");

    // await this.achievements();
    // console.log("✅ Achievements");

    // await this.roles();
    // console.log("✅ Roles");

    // await this.missing();
    // console.log("✅ Missing");

    // await this.oos();
    // console.log("✅ OOS");

    // await this.oosVer();
    // console.log("✅ OOS");

    await this.wlAchievement();
    console.log("✅ Whitelist Achievement");

    await Legacy.disconnect();
  }

  async wlAchievement() {
    const [bot, users] = await Promise.all([this.bot("ADMIN"), User.find()]);
    const members = await bot.guild.members.fetch();

    const nowla = members.filter((member) => {
      if (member.user.bot) {
        return false;
      }

      if (member.roles.cache.has(Config.roleId("HACKER"))) {
        const user = users.find((u) => u.id === member.id)!;
        if (user && !user.hasAchievement("FINISHED_TRAINER")) {
          return true;
        }
      }

      return false;
    });

    console.log(nowla.size);

    const progress = this.getProgressBar(nowla.map((u) => u.displayName));
    progress.start();

    const wlAchievement = await Achievement.findOneByOrFail({
      id: "FINISHED_TRAINER",
    });

    for (let i = 0; i < nowla.size; i++) {
      const member = nowla.at(i)!;
      let user = users.find((u) => u.id === member.id)!;
      user.achievements ||= [];
      user.achievements.push(wlAchievement);
      await user.save();
      progress.complete(member.displayName);
    }

    progress.stop();
  }

  async missing() {
    const [bot, users] = await Promise.all([this.bot("ADMIN"), User.find()]);
    const members = await bot.guild.members.fetch();

    const missing = members.filter((m) => {
      if (m.user.bot) {
        return false;
      }
      const user = users.find((u) => u.id === m.id);
      return user === undefined;
    });

    console.log(missing.size);

    if (missing.size === 0) {
      return;
    }

    console.log(json(missing.map((m) => m.displayName)));

    // const progress = this.getProgressBar(missing.map((m) => m.displayName));
    // progress.start();

    // await Promise.all(
    //   missing.map(async (member) => {
    //     const dormitory = await Dormitory.choose();

    //     if (dormitory === null) {
    //       throw new Error();
    //     }

    //     const user = User.create({
    //       id: member.id,
    //       discordId: member.id,
    //       displayName: member.displayName,
    //       strength: 100,
    //       dormitoryTenancy: DormitoryTenancy.create({ dormitory }),
    //       apartmentTenancies: [],
    //       inGame: true,
    //     });

    //     await Promise.all([
    //       member.roles.add(dormitory.citizenRole.discordId),
    //       user.save(),
    //     ]);

    //     progress.complete(user.displayName);
    //     return;
    //   })
    // );
  }

  async oosVer() {
    const [bot, users] = await Promise.all([this.bot("ADMIN"), User.find()]);
    const members = await bot.guild.members.fetch();

    const oos = members.filter((member) => {
      if (member.user.bot) {
        return false;
      }

      return (
        (member.roles.cache.has(Config.roleId("THE_LEFT_CITIZEN")) ||
          member.roles.cache.has(Config.roleId("THE_RIGHT_CITIZEN")) ||
          member.roles.cache.has(Config.roleId("THE_GRID_CITIZEN")) ||
          member.roles.cache.has(Config.roleId("BULLSEYE_CITIZEN")) ||
          member.roles.cache.has(Config.roleId("VULTURE_CITIZEN"))) &&
        !member.roles.cache.has(Config.roleId("PREGEN")) &&
        !member.roles.cache.has(Config.roleId("DEGEN"))
      );
    });

    console.log(oos.size);

    const progress = this.getProgressBar(oos.map((u) => u.displayName));
    progress.start();

    for (let i = 0; i < oos.size; i++) {
      const member = oos.at(i)!;
      let user = users.find((u) => u.id === member.id)!;

      const dormitory = await Dormitory.choose();

      if (dormitory === null) {
        throw new Error();
      }

      const dm = user.dormitoryTenancy;
      user.inGame = false;

      await Promise.all([member.roles.remove(member.roles.cache), user.save()]);

      if (dm) {
        await dm.remove();
      }

      progress.complete(user.displayName);
    }

    progress.stop();
  }

  async oos() {
    const [bot, users] = await Promise.all([this.bot("ADMIN"), User.find()]);
    const members = await bot.guild.members.fetch();

    const oos = members.filter((member) => {
      if (member.user.bot) {
        return false;
      }
      let user = users.find((u) => u.id === member.id)!;
      return user.apartmentTenancies.length === 0 && !user.dormitoryTenancy;
    });

    console.log(oos.size);

    const progress = this.getProgressBar(oos.map((u) => u.displayName));
    progress.start();

    for (let i = 0; i < members.size; i++) {
      const member = members.at(i)!;
      let user = users.find((u) => u.id === member.id)!;

      if (user.apartmentTenancies.length === 0 && !user.dormitoryTenancy) {
        const dormitory = await Dormitory.choose();

        if (dormitory === null) {
          throw new Error();
        }

        user.dormitoryTenancy = DormitoryTenancy.create({ dormitory });
        user.inGame = true;

        await Promise.all([
          member.roles.add(dormitory.citizenRole.discordId),
          user.save(),
        ]);

        progress.complete(user.displayName);
      }
    }

    progress.stop();
  }

  async ecc() {
    const [bot, users] = await Promise.all([this.bot("ADMIN"), User.find()]);
    const members = await bot.guild.members.fetch();

    const progress = this.getProgressBar(members.map((u) => u.displayName));
    progress.start();

    let missing = 0;
    let oos = 0;

    await Promise.all(
      members.map(async (member) => {
        let user = users.find((u) => u.id === member.id);

        if (!user) {
          const dormitory = await Dormitory.choose();

          if (dormitory === null) {
            throw new Error();
          }

          const user = User.create({
            id: member.id,
            discordId: member.id,
            displayName: member.displayName,
            strength: 100,
            dormitoryTenancy: DormitoryTenancy.create({ dormitory }),
            apartmentTenancies: [],
            inGame: true,
          });

          await Promise.all([
            member.roles.add(dormitory.citizenRole.discordId),
            user.save(),
          ]);

          missing++;
          progress.complete(user.displayName);
          return;
        }

        if (user.apartmentTenancies.length === 0) {
          await member.roles.remove([
            Config.roleId("D1_CITIZEN"),
            Config.roleId("D2_CITIZEN"),
            Config.roleId("D3_CITIZEN"),
            Config.roleId("D4_CITIZEN"),
            Config.roleId("D5_CITIZEN"),
            Config.roleId("D6_CITIZEN"),
          ]);
        }

        if (!user.dormitoryTenancy) {
          await member.roles.remove([
            Config.roleId("THE_LEFT_CITIZEN"),
            Config.roleId("THE_RIGHT_CITIZEN"),
            Config.roleId("THE_GRID_CITIZEN"),
            Config.roleId("BULLSEYE_CITIZEN"),
            Config.roleId("VULTURE_CITIZEN"),
          ]);
        }

        if (user.apartmentTenancies.length === 0 && !user.dormitoryTenancy) {
          const dormitory = await Dormitory.choose();

          if (dormitory === null) {
            throw new Error();
          }

          user.dormitoryTenancy = DormitoryTenancy.create({ dormitory });

          await Promise.all([
            member.roles.add(dormitory.citizenRole.discordId),
            user.save(),
          ]);
          oos++;
        }

        progress.complete(user.displayName);
      })
    );

    console.log(missing, oos);
  }

  async roles() {
    const [bot, users] = await Promise.all([this.bot("ADMIN"), User.find()]);

    const members = await bot.guild.members.fetch();
    const verified = members.filter((m) => {
      return m.roles.cache.has(Config.roleId("VERIFIED"));
    });

    const porv = members.filter((m) => {
      return (
        m.roles.cache.has(Config.roleId("VERIFIED")) ||
        m.roles.cache.has(Config.roleId("PREGEN"))
      );
    });

    const notInGame = porv.filter((m) => {
      const user = users.find((u) => u.id === m.id);
      return user === undefined || !user.inGame;
    });

    console.log(notInGame.size);

    // const mv = users.filter((u) => {
    //   return !u.inGame && verified.has(u.id);
    // });

    // await Promise.all(
    //   mv.map(async (u) => {
    //     u.inGame = true;
    //     await u.save();
    //   })
    // );
    // return;

    // await User.save(
    //   verified.map((m) => User.create({ id: m.id, inGame: true }))
    // );

    const nigProgress = this.getProgressBar(
      notInGame.map((u) => u.displayName)
    );
    // nigProgress.start();

    await Promise.all(
      notInGame.map(async (member) => {
        const dormitory = await Dormitory.choose();

        if (dormitory === null) {
          throw new Error();
        }

        const user = users.find((u) => u.id === member.id)!;
        if (!user) {
          return;
        }
        user.dormitoryTenancy = DormitoryTenancy.create({ dormitory });

        // const user = User.create({
        //   id: member.id,
        //   discordId: member.id,
        //   displayName: member.displayName,
        //   strength: 100,
        //   dormitoryTenancy: DormitoryTenancy.create({ dormitory }),
        //   apartmentTenancies: [],
        //   inGame: true,
        // });

        await user.save();
        console.log(dormitory.citizenRole.discordId);
        await member.roles.add(dormitory.citizenRole.discordId);
        // nigProgress.complete(member.displayName);
      })
    );

    nigProgress.stop();

    const roleProgress = this.getProgressBar(
      verified.map((u) => u.displayName)
    );
    roleProgress.start();

    for (let i = 0; i < verified.size; i++) {
      await verified.at(i)!.roles.add(Config.roleId("PREGEN"));
      await verified.at(i)!.roles.remove(Config.roleId("VERIFIED"));
      roleProgress.complete(verified.at(i)!.displayName);
    }

    roleProgress.stop();
  }

  async achievements() {
    const [prev, users, achievement] = await Promise.all([
      Legacy.User.find({ relations: ["achievements"] }),
      User.find(),
      Achievement.findOneOrFail({ where: { id: "FINISHED_TRAINER" } }),
    ]);

    const finishedUsers = prev.filter((u) =>
      u.hasAchievement(AchievementEnum.FINISHED_TRAINER)
    );

    const progress = this.getProgressBar(
      finishedUsers.map((u) => u.displayName)
    );
    progress.start();

    await Promise.all(
      finishedUsers.map(async (user) => {
        const next = users.find((u) => u.id === user.discordId)!;
        next.achievements = [achievement];
        await next.save();
        progress.complete(next.displayName);
        return next;
      })
    );
  }

  async playerEvents() {
    const [prev, users] = await Promise.all([
      Legacy.PlayerEvent.find({ relations: ["user"] }),
      User.find(),
    ]);

    const progress = this.getProgressBar(prev.map((t) => t.id.toString()));
    progress.start();

    await Promise.all(
      prev.map(async (playerEvent) => {
        const next = new PlayerEvent();

        next.user = users.find((u) => u.id === playerEvent.user.discordId)!;
        next.eventType = playerEvent.eventType;
        next.success = playerEvent.success;
        next.isInstigator = playerEvent.isInstigator;
        next.itemId = playerEvent.itemId;
        next.cooldown = playerEvent.cooldown;
        next.adversaryId = playerEvent.adversaryId;
        next.adversaryName = playerEvent.adversaryName;
        next.createdAt = playerEvent.createdAt;
        next.updatedAt = playerEvent.updatedAt;

        await next.save();
        progress.complete(playerEvent.id.toString());
      })
    );
  }

  async pledges() {
    const [prev, users] = await Promise.all([
      Legacy.Pledge.find({ relations: ["user"] }),
      User.find(),
    ]);

    const next = prev.map((pledge) => {
      const next = new Pledge();
      next.user = users.find((u) => u.id === pledge.user.discordId)!;
      next.yld = pledge.yld;
      return next;
    });

    await Pledge.save(next);
  }

  async apartmentTenancies() {
    let [tenancies, districts, users] = await Promise.all([
      Legacy.ApartmentTenancy.find({ relations: ["user"] }),
      District.find(),
      User.find(),
    ]);

    tenancies = tenancies.filter((t) => t.user);

    const progress = this.getProgressBar(
      tenancies.map((t) => t.user.displayName)
    );
    progress.start();

    await Promise.all(
      tenancies.map(async (tenancy) => {
        const next = new ApartmentTenancy();
        next.district = districts.find(
          (d) => d.id === tenancy.district.symbol.replace("PROJECTS_", "")
        )!;
        next.user = users.find((u) => u.id === tenancy.user.discordId)!;
        next.level = "AUTHORITY";
        next.discordChannelId = tenancy.discordChannelId;
        await next.save();
        progress.complete(tenancy.user.displayName);
      })
    );
  }

  async dormTenancies() {
    let [tenancies, dorms, users] = await Promise.all([
      Legacy.DormitoryTenancy.find({ relations: ["user"] }),
      Dormitory.find(),
      User.find(),
    ]);

    tenancies = tenancies.filter((t) => t.user);

    const progress = this.getProgressBar(
      tenancies.map((t) => t.user.displayName)
    );
    progress.start();

    await Promise.all(
      tenancies.map(async (tenancy) => {
        const next = new DormitoryTenancy();
        next.dormitory = dorms.find((d) => d.id === tenancy.dormitory.symbol)!;
        next.user = users.find((u) => u.id === tenancy.user.discordId)!;
        await next.save();
        progress.complete(tenancy.user.displayName);
      })
    );
  }

  async martItems() {
    const ownerships = await Legacy.MartItemOwnership.find({
      relations: ["user"],
    });

    const progress = this.getProgressBar(
      ownerships.map((c) => c.id.toString())
    );
    progress.start();

    const [users, martItems] = await Promise.all([
      User.find(),
      MartItem.find(),
    ]);

    await Promise.all(
      ownerships.map(async (ownership) => {
        const next = new MartItemOwnership();
        next.user = users.find((u) => u.id === ownership.user.discordId)!;
        next.item = martItems.find((i) => i.id === ownership.item.symbol)!;
        await next.save();
        progress.complete(ownership.id.toString());
      })
    );
  }

  async invites() {
    // const prev = await Legacy.Invite.find();
    // const next = prev.map((i) => Invite.create(i));
    // await Invite.save(next);
  }

  async campaignInvites() {
    const prev = await Legacy.CampaignInvite.find();
    const next = prev.map((i) => CampaignInvite.create(i));
    await CampaignInvite.save(next);
  }

  async users() {
    const prev = await Legacy.User.find();

    const next = prev.map<User>((u) => {
      const user = new User();

      user.id = u.discordId;
      user.discordId = u.discordId;
      user.originalId = u.id;
      user.inventory = u.inventory;
      user.displayName = u.displayName;
      user.gbt = u.gbt;
      user.strength = 100;
      user.inGame = u.inGame;
      user.createdAt = u.createdAt;
      user.updatedAt = u.updatedAt;

      return user;
    });

    await User.save(next);
  }
}
