import Manifest from "manifest";
import { Emoji, Role } from "data/db";
import Color from "color";
import { RoleData } from "discord.js";
import { Command } from "../../lib";

export default class SyncRoles extends Command {
  static description = "Sync Roles";

  async run(): Promise<void> {
    const { roles } = await Manifest.load();

    let [syncs, emojis, bot] = await Promise.all([
      Role.find(),
      Emoji.find(),
      this.bot("ADMIN"),
    ]);

    syncs = syncs.filter((r) => r.id !== "ADMIN_BOT");

    const progress = this.getProgressBar(roles.map((c) => c.id));
    progress.start();

    await Promise.all(
      syncs.map(async (r) => {
        const source = roles.find((s) => s.id === r.id);

        if (!source) {
          throw new Error(`Role ${r.id} row not found.`);
        }

        const dr = await bot.guild.roles.fetch(r.discordId);

        if (!dr) {
          throw new Error(`Discord role not found: ${r.id}:${r.discordId}`);
        }

        let props: RoleData = {
          name: source.name,
          color: Color(source.color).rgbNumber(),
          permissions: source.permissions,
        };

        if (bot.guild.features.includes("ROLE_ICONS") && source.emoji.id) {
          const row = emojis.find((e) => e.id === source.emoji.id);
          if (!row) {
            throw new Error(`Emoji ${source.emoji.id} row not found.`);
          }

          const id = source.emoji.identifier.split(":")[1];
          const guildEmoji = await bot.guild.emojis.fetch(id);

          if (!guildEmoji) {
            throw new Error(`Emoji ${source.emoji.id} guild emoji not found.`);
          }

          props = { ...props, icon: guildEmoji };
        }

        await dr.edit(props);
        progress.complete(source.id);
      })
    );
  }
}
