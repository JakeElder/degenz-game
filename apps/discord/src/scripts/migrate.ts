import {
  connect,
  disconnect,
  User,
  Achievement,
  District,
  MartItem,
} from "data/db";
import { Db, MongoClient } from "mongodb";
import Config from "config";
import { groupBy } from "lodash";
import { PlayerModel, Tenancy } from "./t";
import { TenancyType } from "data/types";
import util from "util";

let db: Db;

async function run() {
  const mongo = new MongoClient(process.env.MONGO_URI!);
  db = mongo.db();
  await mongo.connect();
  await connect();
  const users = await getUsers();

  const allAchievements = await Achievement.find();
  const allDistricts = await District.find();
  const allItems = await MartItem.find();

  // console.log(groupBy(users, (u) => u.tenancies.length));

  await Promise.all(
    users.map(async (u) => {
      const user = await User.findOne({
        where: { discordId: u.Player.DiscordId.toString() },
      });

      // @ts-ignore
      user!.achievements = u.achievements
        .map<Achievement | undefined>((achievement) => {
          const match = allAchievements.find((na) => na.symbol === achievement);
          if (match) {
            return match;
          }
        })
        .filter((a) => typeof a !== "undefined");

      await user!.save();

      // const user = User.create({
      //   discordId: u.Player.DiscordId.toString(),
      //   displayName: u.Player.Name,
      //   gbt: u.Player.Bank,
      //   strength: u.strength,
      //   martItemOwnerships: u.items.map((i) => {
      //     const m = {
      //       "ramen-noodles": "NOODLES",
      //       pizza: "PIZZA",
      //       "grilled-rat": "GRILLED_RAT",
      //     }[i.itemId];
      //     const item = allItems.find((i) => i.symbol === m)!;
      //     return { item };
      //   }),
      //   tenancies: [
      //     {
      //       discordChannelId: u.tenancies[0].propertyId,
      //       type: TenancyType.AUTHORITY,
      //       district: allDistricts.find(
      //         (d) => d.symbol === `PROJECTS_D${u.tenancies[0].district}`
      //       ),
      //     },
      //   ],
      //   achievements: u.achievements
      //     .map((achievement) => {
      //       const match = allAchievements.find((na) => na.symbol === achievement);
      //       return match ? match : {};
      //     })
      //     .filter((a) => "symbol" in a),
      // });
      return user;
    })
  );

  // console.log(util.inspect(newUsers, { depth: null, colors: true }));

  // await Promise.all(newUsers.map((u) => u.save()));

  mongo.close();
  disconnect();
}

export async function getUsers() {
  const players = db.collection<PlayerModel>("players");

  const p = players.aggregate<PlayerModel & { tenancies: Tenancy[] }>([
    {
      $lookup: {
        from: "tenancies",
        localField: "Player.DiscordId",
        foreignField: "userId",
        as: "tenancies",
      },
    },
  ]);

  return p.toArray();
}

run();
