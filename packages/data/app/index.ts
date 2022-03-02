import "reflect-metadata";
import { Connection, ConnectionOptionsReader, createConnection } from "typeorm";
import findParentDir from "find-parent-dir";
import { Achievement } from "./entity/Achievement";
import { AppState } from "./entity/AppState";
import { District } from "./entity/District";
import { Imprisonment } from "./entity/Imprisonment";
import { MartItem } from "./entity/MartItem";
import { MartItemOwnership } from "./entity/MartItemOwnership";
import { NPC } from "./entity/NPC";
import { PersistentMessage } from "./entity/PersistentMessage";
import { PlayerEvent } from "./entity/PlayerEvent";
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
  return connection;
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
  PersistentMessage,
  Pledge,
  Tenancy,
  User,
};
