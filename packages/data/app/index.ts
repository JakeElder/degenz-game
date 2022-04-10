import "reflect-metadata";
import { Connection, ConnectionOptionsReader, createConnection } from "typeorm";
import findParentDir from "find-parent-dir";
import { Achievement } from "./entity/Achievement";
import { ApartmentTenancy } from "./entity/ApartmentTenancy";
import { AppState } from "./entity/AppState";
import { CampaignInvite } from "./entity/CampaignInvite";
import { Channel } from "./entity/Channel";
import { District } from "./entity/District";
import { Dormitory } from "./entity/Dormitory";
import { DormitoryTenancy } from "./entity/DormitoryTenancy";
import { Emoji } from "./entity/Emoji";
import { Imprisonment } from "./entity/Imprisonment";
import { MartItem } from "./entity/MartItem";
import { MartItemOwnership } from "./entity/MartItemOwnership";
import { NPC } from "./entity/NPC";
import { PersistentMessage } from "./entity/PersistentMessage";
import { Pledge } from "./entity/Pledge";
import { QuestLogChannel } from "./entity/QuestLogChannel";
import { QuestLogMessage } from "./entity/QuestLogMessage";
import { Role } from "./entity/Role";
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
  ApartmentTenancy,
  AppState,
  CampaignInvite,
  Channel,
  District,
  Dormitory,
  DormitoryTenancy,
  Emoji,
  Imprisonment,
  MartItem,
  MartItemOwnership,
  NPC,
  PersistentMessage,
  Pledge,
  QuestLogChannel,
  QuestLogMessage,
  Role,
  User,
};
