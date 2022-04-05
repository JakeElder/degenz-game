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

  static async load() {
    const [structure, roles, bots] = await Promise.all([
      this.structure(),
      this.roles(),
      this.bots(),
    ]);
    return { structure, roles, bots };
  }
}
