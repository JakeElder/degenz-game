export default class Manifest {
  static async structure() {
    const { default: structure } = await import("./structure");
    return structure;
  }

  static async roles() {
    const { default: roles } = await import("./roles");
    return roles;
  }

  static async bots() {
    const { default: bots } = await import("./bots");
    return bots;
  }

  static async emojis() {
    const { default: emojis } = await import("./emojis");
    return emojis;
  }

  static async load() {
    const [structure, roles, bots, emojis] = await Promise.all([
      this.structure(),
      this.roles(),
      this.bots(),
      this.emojis(),
    ]);
    return { structure, roles, bots, emojis };
  }
}
