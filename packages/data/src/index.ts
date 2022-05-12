import "reflect-metadata";
import dataSource from "./data-source";

export { Achievement } from "./entity/Achievement";
export { ApartmentTenancy } from "./entity/ApartmentTenancy";
export { AppState } from "./entity/AppState";
export { CampaignInvite } from "./entity/CampaignInvite";
export { DiscordChannel } from "./entity/DiscordChannel";
export { District } from "./entity/District";
export { Dormitory } from "./entity/Dormitory";
export { DormitoryTenancy } from "./entity/DormitoryTenancy";
export { Emoji } from "./entity/Emoji";
export { Imprisonment } from "./entity/Imprisonment";
// export { Invite } from "./entity/Invite";
// export { InvitedUser } from "./entity/InvitedUser";
export { ManagedChannel } from "./entity/ManagedChannel";
export { MartItem } from "./entity/MartItem";
export { MartItemOwnership } from "./entity/MartItemOwnership";
export { NPC } from "./entity/NPC";
export { PersistentMessage } from "./entity/PersistentMessage";
export { PlayerEvent } from "./entity/PlayerEvent";
export { Pledge } from "./entity/Pledge";
export { QuestLogChannel } from "./entity/QuestLogChannel";
export { Reaction } from "./entity/Reaction";
export { Role } from "./entity/Role";
export { User } from "./entity/User";

export async function connect() {
  await dataSource.initialize();
}

export async function disconnect() {
  await dataSource.destroy();
}
