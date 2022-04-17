export default class Manifest {
  static async load() {
    const { achievements } = await import("./achievements");
    const { channels } = await import("./channels");
    const { districts } = await import("./districts");
    const { dormitories } = await import("./dormitories");
    const { emojis } = await import("./emojis");
    const { martItems } = await import("./mart-items");
    const { npcs } = await import("./npcs");
    const { persistentMessages } = await import("./persistent-messages");
    const { roles } = await import("./roles");

    return {
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
}
