import "reflect-metadata";
import { Connection, ConnectionOptionsReader, createConnection } from "typeorm";
import findParentDir from "find-parent-dir";
// import { Achievement as AchievementEnum, DistrictSymbol } from "./types";
import { Achievement } from "./entity/Achievement";
import { AppState } from "./entity/AppState";
import { District } from "./entity/District";
import { Event } from "./entity/Event";
import { Imprisonment } from "./entity/Imprisonment";
import { MartItem } from "./entity/MartItem";
import { MartItemOwnership } from "./entity/MartItemOwnership";
import { NPC } from "./entity/NPC";
import { Pledge } from "./entity/Pledge";
import { Tenancy } from "./entity/Tenancy";
import { User } from "./entity/User";

let connection: Connection;

async function findPackageRoot(i = 0): Promise<string> {
  const dir = await new Promise<string | null>((resolve, reject) => {
    if (!module.paths[i]) {
      reject();
    }
    findParentDir(module.paths[i], "ormconfig.js", (_, dir) => {
      resolve(dir);
    });
  });
  return dir ? dir : findPackageRoot(i++);
}

export async function connect() {
  const connectionOptionsReader = new ConnectionOptionsReader({
    root: await findPackageRoot(),
  });

  const options = await connectionOptionsReader.get("default");
  connection = await createConnection(options);

  // if (process.env.SEED) {
  // await seed();
  // }

  // await connection.query("DROP TABLE user CASCADE");

  // const t = await Tenancy.findOne({
  //   relations: ["user"],
  //   where: { discordChannelId: "a", type: TenancyType.AUTHORITY },
  // });

  // console.log(t);

  //   const c = await Achievement.insert(
  //     Object.keys(AchievementEnum).map((k) => {
  //       return {
  //         symbol: (AchievementEnum as any)[k as any],
  //       };
  //     })
  //   );

  //   await MartItem.insert([
  //     {
  //       symbol: "PIZZA",
  //       name: "Fat Pizza \u00a9",
  //       description: "A slice of Fat Pizza",
  //       price: 25,
  //       stock: 0,
  //       strengthIncrease: 10,
  //     },
  //     {
  //       symbol: "NOODLES",
  //       name: "Degenz Brand Ramen Noodles \u00a9",
  //       description:
  //         "Luxurious instant noodles, complete with a packet of RatSpice.",
  //       price: 10,
  //       stock: 0,
  //       strengthIncrease: 4,
  //     },
  //     {
  //       symbol: "GRILLED_RAT",
  //       name: "Nuu Ping \u00a9",
  //       description: "Succulent rat meat, barbecue grilled to perfection.",
  //       price: 1,
  //       stock: 40,
  //       strengthIncrease: 1,
  //     },
  //   ]);

  // await User.remove(await User.find());

  // const user = User.create({
  //   discordId: "xy",
  //   displayName: "person",
  //   gbt: 100,
  //   tenancies: [
  //     {
  //       discordChannelId: "b",
  //       type: TenancyType.AUTHORITY,
  //       neighbourhood: Neighbourhood.PROJECTS_D1,
  //     },
  //   ],
  //   imprisonments: [],
  //   achievements: [],
  // });
  // await user.save({ reload: true });

  // user.imprisonments.push(
  //   Imprisonment.create({
  //     cellNumber: 1,
  //     discordChannelId: "a",
  //     entryRoles: ["z", "s"],
  //   })
  // );
  // const HR = await Achievement.findOne({
  //   where: { symbol: AchievementEnum.HELP_REQUESTED },
  // });

  // user.achievements.push(HR!);

  // await user.save();

  // const user = await User.findOne({
  //   where: { discordId: "xy" },
  //   relations: ["imprisonments", "achievements", "martItemOwnerships"],
  // });

  // const pizza = await MartItem.findOne({ where: { symbol: "PIZZA" } });

  // console.log(user);
  // await MartItemOwnership.insert({ user, item: pizza });

  // user!.reload();
  // console.log(user);
  // const HR = await Achievement.findOne({
  //   where: { symbol: AchievementEnum.JOINED_THE_DEGENZ },
  // });

  // user!.achievements.push(HR!);

  // await user!.save();
  //   await user!.remove();

  // const imprisonment = await Imprisonment.findOne(4);
  // console.log(imprisonment);
  // imprisonment!.softRemove();

  // console.log(user!.martItemOwnerships);
  // const item = await MartItem.findOne({ where: { symbol: "PIZZA" } });

  // await MartItemOwnership.insert({ user, item });

  // user!.martItems.push(pizza!);
  // await user!.save();

  // console.log(user);

  // const ownershipCount = await MartItemOwnership.count({
  //   where: { item, user },
  // });

  // console.log(ownershipCount);

  // User.createQueryBuilder()
  //   .update(User)
  //   .set({ strength: () => "GREATEST(strength - 40, 0)" })
  //   .execute()

  return connection;

  // await connection.synchronize();

  // const user = connection.manager.create(User, {
  //   discordId: "id",
  //   displayName: "a",
  //   gbt: 100.00004,
  // });

  // await user.save();

  // const user = new User();
  // user.discordId = "a";
  // user.softRemove();
  // await user.save();

  // const allUsers = await User.find();
  // const firstUser = await User.findOne(1);
  // const timber = await User.findOne({ firstName: "Timber", lastName: "Saw" });
}

async function seed() {
  // await Promise.all([
  //   NPC.delete({}),
  //   District.delete({}),
  //   Achievement.delete({}),
  //   AppState.delete({}),
  //   MartItem.delete({}),
  // ]);

  await Promise.all([
    // NPC.insert([
    //   { symbol: "ADMIN", defaultEmojiId: "-" },
    //   { symbol: "ALLY", defaultEmojiId: "-" },
    //   { symbol: "ARMORY_CLERK", defaultEmojiId: "-" },
    //   { symbol: "BANKER", defaultEmojiId: "-" },
    //   { symbol: "BIG_BROTHER", defaultEmojiId: "-" },
    //   { symbol: "MART_CLERK", defaultEmojiId: "-" },
    //   { symbol: "PRISONER", defaultEmojiId: "-" },
    //   { symbol: "SENSEI", defaultEmojiId: "-" },
    //   { symbol: "TOSSER", defaultEmojiId: "-" },
    //   { symbol: "WARDEN", defaultEmojiId: "-" },
    // ]),
    //     Achievement.insert(
    //       Object.keys(AchievementEnum).map((k) => {
    //         return {
    //           symbol: (AchievementEnum as any)[k as any],
    //         };
    //       })
    //     ),
    //     MartItem.insert([
    //       {
    //         symbol: "PIZZA",
    //         name: "Fat Pizza \u00a9",
    //         description: "A slice of Fat Pizza",
    //         price: 25,
    //         stock: 0,
    //         strengthIncrease: 10,
    //       },
    //       {
    //         symbol: "NOODLES",
    //         name: "Degenz Brand Ramen Noodles \u00a9",
    //         description:
    //           "Luxurious instant noodles, complete with a packet of RatSpice.",
    //         price: 10,
    //         stock: 0,
    //         strengthIncrease: 4,
    //       },
    //       {
    //         symbol: "GRILLED_RAT",
    //         name: "Nuu Ping \u00a9",
    //         description: "Succulent rat meat, barbecue grilled to perfection.",
    //         price: 1,
    //         stock: 37,
    //         strengthIncrease: 1,
    //       },
    //     ]),
    //     District.insert([
    //       {
    //         symbol: DistrictSymbol.PROJECTS_D1,
    //         open: false,
    //         emoji: "-",
    //         activeEmoji: "-",
    //         inactiveEmoji: "-",
    //       },
    //       {
    //         symbol: DistrictSymbol.PROJECTS_D2,
    //         open: false,
    //         emoji: "-",
    //         activeEmoji: "-",
    //         inactiveEmoji: "-",
    //       },
    //       {
    //         symbol: DistrictSymbol.PROJECTS_D3,
    //         open: false,
    //         emoji: "-",
    //         activeEmoji: "-",
    //         inactiveEmoji: "-",
    //       },
    //       {
    //         symbol: DistrictSymbol.PROJECTS_D4,
    //         open: false,
    //         emoji: "-",
    //         activeEmoji: "-",
    //         inactiveEmoji: "-",
    //       },
    //       {
    //         symbol: DistrictSymbol.PROJECTS_D5,
    //         open: false,
    //         emoji: "-",
    //         activeEmoji: "-",
    //         inactiveEmoji: "-",
    //       },
    //       {
    //         symbol: DistrictSymbol.PROJECTS_D6,
    //         open: false,
    //         emoji: "-",
    //         activeEmoji: "-",
    //         inactiveEmoji: "-",
    //       },
    //     ]),
    // AppState.insert([
    //   {
    //     entryMessageId: "-",
    //     verifyMessageId: "933958426898337802",
    //     leaderboardMessageId: "935854598181228545",
    //   },
    // ]),
  ]);
}

export async function disconnect() {
  if (connection) {
    await connection.close();
  }
}

export {
  Achievement,
  AppState,
  District,
  Event,
  Imprisonment,
  MartItem,
  MartItemOwnership,
  NPC,
  Pledge,
  Tenancy,
  User,
};
