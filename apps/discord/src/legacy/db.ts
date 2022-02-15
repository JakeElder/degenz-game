import { GuildMember, TextChannel } from "discord.js";
import { Db, MongoClient, Long } from "mongodb";
import { v4 as uuid } from "uuid";
import {
  User,
  MartItem,
  UserItemType,
  Achievement,
  Cell,
  Tenancy,
  PlayerModel,
} from "./types";

let db: Db;
let mongo: MongoClient;

export async function connect(uri: string) {
  mongo = new MongoClient(uri);
  db = mongo.db();
  await mongo.connect();
}

export async function disconnect() {
  await mongo.close();
}

function playerToUser(player: PlayerModel): User {
  const user: User = {
    id: player.Player.DiscordId.toString(),
    strength: player.strength,
    achievements: player.achievements,
    items: player.items,
    name: player.Player.Name,
    tokens: player.Player.Bank,
  };

  if (player.tenancies) {
    user.tenancies = player.tenancies;
  }

  return user;
}

export async function getMartItems() {
  const martItems = db.collection<MartItem>("mart-items");
  const items = await martItems.find({}).sort({ price: -1 }).toArray();
  return items;
}

export async function getLeaders(amount: number = 50) {
  const col = db.collection<PlayerModel>("players");
  const players = col
    .find()
    .sort({ "Player.Bank": -1 })
    .limit(amount)
    .toArray();
  const users = (await players).map((p) => playerToUser(p));
  return users;
}

export async function getUser(id: string) {
  const players = db.collection<PlayerModel>("players");

  const p = await players
    .aggregate<PlayerModel & { tenancies: Tenancy[] }>([
      { $match: { "Player.DiscordId": new Long(id) } },
      {
        $lookup: {
          from: "tenancies",
          localField: "Player.DiscordId",
          foreignField: "userId",
          as: "tenancies",
        },
      },
    ])
    .limit(1)
    .toArray();

  if (!p[0]) {
    return null;
  }

  return playerToUser(p[0]);
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

  const allPlayers = await p.toArray();

  if (allPlayers === null) {
    return null;
  }

  return allPlayers.map(playerToUser);
}

export async function getDistrict(): Promise<Tenancy["district"] | null> {
  const game = db.collection("game");
  const g = await game.findOne({});
  return g!.openDistrict;
}

export async function setDistrict(district: number | null) {
  const game = db.collection("game");
  const g = await game.updateOne({}, { $set: { openDistrict: district } });
  return g;
}

export async function getTenanciesInDistrict(number: Tenancy["district"]) {
  const tenancies = db.collection<Tenancy>("tenancies");

  const t = await tenancies.find({ district: number }).count();

  return t;
}

export async function getUserByApartment(id: string) {
  const tenancies = db.collection<Tenancy>("tenancies");
  const players = db.collection<PlayerModel>("players");

  const t = await tenancies.findOne({ propertyId: id });

  if (t === null) {
    return null;
  }

  const player = await players.findOne({ "Player.DiscordId": t.userId });

  if (player === null) {
    return null;
  }

  return playerToUser(player);
}

export async function eatItem(itemId: MartItem["id"], memberId: User["id"]) {
  const items = await getMartItems();
  const pi = items.find((i) => i.id === itemId);

  if (!pi) {
    return { success: false, code: "ITEM_NOT_FOUND" };
  }

  const players = db.collection<PlayerModel>("players");

  try {
    const player = (await players.findOne({
      "Player.DiscordId": new Long(memberId),
    }))!;
    const user = playerToUser(player);

    if (!user.items.find((i) => i.itemId === itemId)) {
      return { success: false, code: "NOT_IN_INVENTORY" };
    }

    const idx = user.items.findIndex((i) => i.itemId === itemId);
    user.items.splice(idx, 1);

    await players.updateOne(
      {
        "Player.DiscordId": new Long(memberId),
      },
      {
        $set: {
          items: user.items,
          strength: Math.max(
            Math.min(100, user.strength + pi.strengthIncrease),
            0
          ),
        },
      }
    );
  } catch (e) {
    console.log(e);
    return { success: false, code: "DB_ERROR" };
  }

  return { success: true };
}

export async function sellItem(itemId: MartItem["id"], memberId: User["id"]) {
  const items = await getMartItems();
  const pi = items.find((i) => i.id === itemId);

  if (!pi) {
    return { success: false, code: "ITEM_NOT_FOUND" };
  }

  if (!pi.stock) {
    return { success: false, code: "ITEM_NO_STOCK" };
  }

  const martItems = mongo.db().collection<MartItem>("mart-items");
  const users = mongo.db().collection<PlayerModel>("players");

  const player = (await users.findOne({
    "Player.DiscordId": new Long(memberId),
  }))!;
  const user = playerToUser(player);

  if (user.tokens < pi.price) {
    return { success: false, code: "INSUFFICIENT_BALANCE" };
  }

  await martItems.updateOne({ id: pi.id }, { $inc: { stock: -1 } });

  await users.updateOne(
    { "Player.DiscordId": new Long(memberId) },
    {
      $push: { items: { itemId: pi.id, type: UserItemType.MartItem } },
      $inc: { "Player.Bank": -pi.price },
    }
  );

  return { success: true };
}

export async function addUser({
  member,
  apartmentId,
  district,
  tokens = 0,
}: {
  member: GuildMember;
  apartmentId: Tenancy["id"];
  district: Tenancy["district"];
  tokens?: User["tokens"];
}) {
  const users = db.collection<PlayerModel>("players");
  const tenancies = db.collection<Tenancy>("tenancies");

  await tenancies.insertOne({
    id: uuid(),
    userId: new Long(member.id),
    dateCreated: new Date(),
    district,
    memberName: member.displayName,
    propertyId: apartmentId,
    tenancyType: "PRIMARY",
  });

  await users.insertOne({
    name: member.displayName,
    strength: 100,
    items: [],
    achievements: [],
    Player: {
      DiscordId: new Long(member.id),
      Attacks: [],
      Defenses: [],
      Arsenal: [],
      Bank: tokens,
      Name: member.displayName,
    },
  });

  return getUser(member.id);
}

export async function deleteUser(member: GuildMember) {
  const users = db.collection<PlayerModel>("players");
  const tenancies = db.collection<Tenancy>("tenancies");

  await tenancies.deleteOne({ userId: new Long(member.id) });
  const r = await users.deleteOne({ "Player.DiscordId": new Long(member.id) });

  return r.deletedCount === 1;
}

export async function onboardFollowUp(userId: User["id"], amount: number) {
  const users = db.collection<PlayerModel>("players");
  return users.updateOne(
    { "Player.DiscordId": new Long(userId) },
    { $inc: { "Player.Bank": amount } }
  );
}

export async function createCell(userId: User["id"], entryRoleIds: string[]) {
  // TODO: Check for existing
  const cells = db.collection<Cell>("cells");
  const allCells = await cells.find().sort({ number: 1 }).toArray();
  const number = getAvailableCellNumber(allCells);
  const res = await cells.insertOne({
    number,
    userId,
    entryRoleIds,
    cellId: null,
  });
  const cell = await cells.findOne({ _id: res.insertedId });
  return cell;
}

export async function deleteCell(userId: Cell["userId"]) {
  const cells = db.collection<Cell>("cells");
  await cells.deleteOne({ userId });
}

export async function updateCellChannelId(
  userId: Cell["userId"],
  cellId: TextChannel["id"]
) {
  const cells = db.collection<Cell>("cells");
  await cells.updateOne({ userId }, { $set: { cellId } });
}

export async function getCell(userId: User["id"]) {
  const cells = db.collection<Cell>("cells");
  const cell = await cells.findOne({ userId });
  return cell;
}

export async function getCellByChannelId(cellId: Cell["cellId"]) {
  const cells = db.collection<Cell>("cells");
  const cell = await cells.findOne({ cellId });
  return cell;
}

function getAvailableCellNumber(cells: Cell[]) {
  if (cells.length === 0) {
    return 1;
  }

  let num = 1;

  for (let i = 0; i < cells.length; i++) {
    if (cells[i].number === num) {
      num++;
    } else {
      break;
    }
  }

  return num;
}

export async function addAchievements(
  userId: User["id"],
  achievements: Achievement[]
) {
  const users = db.collection<PlayerModel>("players");
  return users.updateOne(
    { "Player.DiscordId": new Long(userId) },
    { $push: { achievements: { $each: achievements } } }
  );
}

export async function addAchievement(
  userId: User["id"],
  achievement: Achievement
) {
  const users = db.collection<PlayerModel>("players");
  return users.updateOne(
    { "Player.DiscordId": new Long(userId) },
    { $push: { achievements: achievement } }
  );
}

export async function transactBalance(userId: string, amount: number) {
  const users = db.collection<PlayerModel>("players");
  return users.updateOne(
    { "Player.DiscordId": new Long(userId) },
    { $inc: { "Player.Bank": amount } }
  );
}

export async function incStrength(amount: number) {
  const users = db.collection<PlayerModel>("players");
  const resA = await users.updateMany({}, { $inc: { strength: amount } });
  const resB = await users.updateMany({}, { $max: { strength: 0 } });
  if (resA.acknowledged & resB.acknowledged) {
    return true;
  }
  return false;
}

export async function issueTokens(amount: number) {
  const users = db.collection<PlayerModel>("players");
  const res = await users.updateMany({}, { $inc: { "Player.Bank": amount } });
  if (res.acknowledged) {
    return true;
  }
  return false;
}

export async function transferBalance(
  senderId: string,
  recipientId: string,
  amount: number
) {
  const users = db.collection<PlayerModel>("players");
  await users.bulkWrite([
    {
      updateOne: {
        filter: { "Player.DiscordId": new Long(senderId) },
        update: { $inc: { "Player.Bank": -amount } },
      },
    },
    {
      updateOne: {
        filter: { "Player.DiscordId": new Long(recipientId) },
        update: { $inc: { "Player.Bank": amount } },
      },
    },
  ]);
}

export { db };
