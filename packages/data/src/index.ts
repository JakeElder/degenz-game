import "reflect-metadata";
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
import { ManagedChannel } from "./entity/ManagedChannel";
import { MartItem } from "./entity/MartItem";
import { MartItemOwnership } from "./entity/MartItemOwnership";
import { NPC } from "./entity/NPC";
import { PersistentMessage } from "./entity/PersistentMessage";
import { Pledge } from "./entity/Pledge";
import { QuestLogChannel } from "./entity/QuestLogChannel";
import { Role } from "./entity/Role";
import { User } from "./entity/User";
import dataSource from "./data-source";

export async function connect() {
  await dataSource.initialize();
}

export async function disconnect() {
  await dataSource.destroy();
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
  ManagedChannel,
  MartItem,
  MartItemOwnership,
  NPC,
  PersistentMessage,
  Pledge,
  QuestLogChannel,
  Role,
  User,
};
