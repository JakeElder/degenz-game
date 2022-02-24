// import { connect, disconnect } from "db";
import { Db, MongoClient } from "mongodb";
import { PlayerModel, Tenancy } from "./t";

let db: Db;

async function run() {
  const mongo = new MongoClient(process.env.MONGO_URI!);
  db = mongo.db();
  await mongo.connect();
  const users = await getUsers();
  console.log(users);
  mongo.close();
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
