import {
  connect,
  disconnect,
  District,
  MartItem,
  User,
  Achievement,
} from "data/db";
import { Command } from "../../lib";

export default class Seed extends Command {
  static description = "Seeds the database";

  async run(): Promise<void> {
    await connect();

    const [allMartItems, allDistricts, allAchievements] = await Promise.all([
      MartItem.find(),
      District.find(),
      Achievement.find(),
    ]);

    const users = require("../../../users.json") as User[];

    const insert = async (u: User, idx: number) => {
      console.log(`${idx + 1} of ${users.length}`);

      const user = User.create({
        discordId: u.discordId,
        displayName: u.displayName,
        gbt: u.gbt,
        strength: u.strength,
        inGame: true,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        welcomeMentionMadeAt: u.createdAt,
        playerEvents: u.playerEvents,
        tenancies: u.tenancies.map((t) => {
          t.district = allDistricts.find(
            (d) => d.symbol === t.district.symbol
          )!;
          return t;
        }),
        pledges: u.pledges,
        imprisonments: u.imprisonments,
        achievements: u.achievements.map((a) => {
          return allAchievements.find((aa) => a.symbol == aa.symbol)!;
        }),
        martItemOwnerships: u.martItemOwnerships.map((o) => {
          o.item = allMartItems.find((i) => i.symbol === o.item.symbol)!;
          return o;
        }),
        inventory: u.inventory,
      });

      await user.save();
    };

    const userDiscordIds = users.map((u) => u.discordId);

    let i = 0;
    for (const user of users) {
      await insert(user, i);
      i++;
    }

    const members = require("../../../members.json");
    const nonGameMembers = members.filter((m) => {
      return !m.user.bot && !userDiscordIds.includes(m.user.id);
    });

    const prime = async (u: any, idx: number) => {
      console.log(`${idx + 1} of ${nonGameMembers.length}`);
      const user = User.create({
        discordId: u.user.id,
        displayName: u.user.username,
        createdAt: new Date(u.joined_at),
        welcomeMentionMadeAt: new Date(u.joined_at),
        inGame: false,
      });
      await user.save();
    };

    i = 0;
    for (const member of nonGameMembers) {
      await prime(member, i);
      i++;
    }

    await disconnect();
  }
}
