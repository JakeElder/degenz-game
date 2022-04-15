export default class Manifest {
  static async load() {
    const { default: channels } = await import("./channels");
    const { default: roles } = await import("./roles");
    const { default: npcs } = await import("./npcs");
    const { default: emojis } = await import("./emojis");
    const { default: districts } = await import("./districts");
    const { default: dormitories } = await import("./dormitories");
    const { default: achievements } = await import("./achievements");
    const { default: persistentMessages } = await import(
      "./persistent-messages"
    );

    return {
      achievements,
      channels,
      roles,
      npcs,
      emojis,
      districts,
      dormitories,
      persistentMessages,
    };
  }
}
