import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Achievement as AchievementEnum, DistrictSymbol } from "types";
import Config from "app-config";
import { Achievement } from "./entity/Achievement";
import { AppState } from "./entity/AppState";
import { District } from "./entity/District";
import { Imprisonment } from "./entity/Imprisonment";
import { MartItem } from "./entity/MartItem";
import { MartItemOwnership } from "./entity/MartItemOwnership";
import { NPC } from "./entity/NPC";
import { Pledge } from "./entity/Pledge";
import { Tenancy } from "./entity/Tenancy";
import { User } from "./entity/User";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import pg from "pg-connection-string";

let connection: Connection;

export async function connect(url: string) {
  const db = pg.parse(url);

  const base: PostgresConnectionOptions = {
    type: "postgres",
    namingStrategy: new SnakeNamingStrategy(),
    entities: [
      Achievement,
      AppState,
      District,
      Imprisonment,
      MartItem,
      MartItemOwnership,
      NPC,
      Pledge,
      Tenancy,
      User,
    ],
  };

  let options: PostgresConnectionOptions;

  if (Config.env("NODE_ENV") === "development") {
    options = { ...base, url, synchronize: true };
  } else {
    options = {
      ...base,
      username: db.user,
      host: db.host!,
      database: db.database!,
      password: db.password!,
      port: db.port ? parseInt(db.port!, 10) : undefined,
      ssl: {
        ca: Config.env("CA_CERT")!.replace(/\\n/g, "\n"),
      },
    };
  }

  connection = await createConnection(options);

  if (process.env.SEED) {
    await seed();
  }

  // await connection.query("DROP TABLE user CASCADE");

  // const t = await Tenancy.findOne({
  //   relations: ["user"],
  //   where: { discordChannelId: "a", type: TenancyType.AUTHORITY },
  // });

  // console.log(t);

  // const c = await Achievement.insert(
  //   Object.keys(AchievementEnum).map((k) => {
  //     return {
  //       symbol: (AchievementEnum as any)[k as any],
  //     };
  //   })
  // );

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
  await Promise.all([
    NPC.insert([
      { symbol: "ALLY", defaultEmojiId: "<:ivan:944574023319294012>" },
      {
        symbol: "ARMORY_CLERK",
        defaultEmojiId: "<:private_willy:944574023264788480>",
      },
      {
        symbol: "BANKER",
        defaultEmojiId: "<:banker_beatrice:944574023294156820>",
      },
      {
        symbol: "BIG_BROTHER",
        defaultEmojiId: "<:big_brother:944574023331905556>",
      },
      { symbol: "MART_CLERK", defaultEmojiId: "<:merris:944574022987968593>" },
      {
        symbol: "PRISONER",
        defaultEmojiId: "<:hugh_donie:944574023185076244>",
      },
      { symbol: "SENSEI", defaultEmojiId: "<:sensei:944574022945996801>" },
      { symbol: "TOSSER", defaultEmojiId: "<:tosser_ted:944574022769848320>" },
      { symbol: "WARDEN", defaultEmojiId: "<:walden:944574022899867679>" },
    ]),

    Achievement.insert(
      Object.keys(AchievementEnum).map((k) => {
        return {
          symbol: (AchievementEnum as any)[k as any],
        };
      })
    ),

    MartItem.insert([
      {
        symbol: "PIZZA",
        name: "Fat Pizza \u00a9",
        description: "A slice of Fat Pizza",
        price: 25,
        stock: 0,
        strengthIncrease: 10,
      },
      {
        symbol: "NOODLES",
        name: "Degenz Brand Ramen Noodles \u00a9",
        description:
          "Luxurious instant noodles, complete with a packet of RatSpice.",
        price: 10,
        stock: 0,
        strengthIncrease: 4,
      },
      {
        symbol: "GRILLED_RAT",
        name: "Nuu Ping \u00a9",
        description: "Succulent rat meat, barbecue grilled to perfection.",
        price: 1,
        stock: 37,
        strengthIncrease: 1,
      },
    ]),

    District.insert([
      {
        symbol: DistrictSymbol.PROJECTS_D1,
        open: false,
        emoji: "<:D1:944296515919302656>",
        activeEmoji: "<:D1A:944296515545997372>",
        inactiveEmoji: "<:D1I:944296515487285268>",
      },
      {
        symbol: DistrictSymbol.PROJECTS_D2,
        open: false,
        emoji: "<:D2:944296515512467548>",
        activeEmoji: "<:D2A:944296515797663814>",
        inactiveEmoji: "<:D2I:944296515109789697>",
      },
      {
        symbol: DistrictSymbol.PROJECTS_D3,
        open: false,
        emoji: "<:D3:944296515734732820>",
        activeEmoji: "<:D3A:944296515365634108>",
        inactiveEmoji: "<:D3I:944296515374055475>",
      },
      {
        symbol: DistrictSymbol.PROJECTS_D4,
        open: false,
        emoji: "<:D4:944324717811208254>",
        activeEmoji: "<:D4A:944322981788803163>",
        inactiveEmoji: "<:D4I:944322981432295434>",
      },
      {
        symbol: DistrictSymbol.PROJECTS_D5,
        open: false,
        emoji: "<:D5:944324717882523698>",
        activeEmoji: "<:D5A:944322981650387004>",
        inactiveEmoji: "<:D5I:944322981298069545>",
      },
      {
        symbol: DistrictSymbol.PROJECTS_D6,
        open: false,
        emoji: "<:D6:944324717840564335>",
        activeEmoji: "<:D6A:944322981193216091>",
        inactiveEmoji: "<:D6I:944322981235155016>",
      },
    ]),

    AppState.insert([
      {
        entryMessageId: "944434734686167080",
        verifyMessageId: "944508874256420896",
        leaderboardMessageId: "944541218405240892",
      },
    ]),
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
  Imprisonment,
  MartItem,
  MartItemOwnership,
  NPC,
  Pledge,
  Tenancy,
  User,
};
