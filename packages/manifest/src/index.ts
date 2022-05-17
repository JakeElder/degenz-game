import { plainToInstance } from "class-transformer";
import {
  Achievement,
  AppState,
  District,
  Dormitory,
  Emoji,
  ManagedChannel,
  MartItem,
  NPC,
  PersistentMessage,
  Role,
} from "data/src";

export default class Manifest {
  static async import() {
    const { achievements } = await import("./achievements");
    const { channels } = await import("./channels");
    const { districts } = await import("./districts");
    const { dormitories } = await import("./dormitories");
    const { emojis } = await import("./emojis");
    const { martItems } = await import("./mart-items");
    const { npcs } = await import("./npcs");
    const { persistentMessages } = await import("./persistent-messages");
    const { roles } = await import("./roles");
    const { appStates } = await import("./app-state");

    return {
      appStates,
      achievements,
      channels,
      districts,
      dormitories,
      emojis,
      martItems,
      npcs,
      persistentMessages,
      roles,
    };
  }

  static async json() {
    return this.import();
  }

  static async load() {
    const {
      appStates,
      achievements,
      channels,
      districts,
      dormitories,
      emojis,
      martItems,
      npcs,
      persistentMessages,
      roles,
    } = await this.import();

    return {
      appStates: plainToInstance(AppState, appStates),
      achievements: plainToInstance(Achievement, achievements),
      channels: plainToInstance(ManagedChannel, channels),
      districts: plainToInstance(District, districts),
      dormitories: plainToInstance(Dormitory, dormitories),
      emojis: plainToInstance(Emoji, emojis),
      martItems: plainToInstance(MartItem, martItems),
      npcs: plainToInstance(NPC, npcs),
      persistentMessages: plainToInstance(
        PersistentMessage,
        persistentMessages
      ),
      roles: plainToInstance(Role, roles),
    };
  }
}
