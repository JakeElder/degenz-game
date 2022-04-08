import { Flags } from "@oclif/core";
import { Routes } from "discord-api-types/v10";
import { Command } from "../../lib";
import _ from "discord.js";
import Config from "config";
import equal from "fast-deep-equal";
import { render } from "prettyjson";

type EnvSymbol = "development" | "stage" | "production";

export default class ListChannels extends Command {
  static description = "Diff of channels between environments";

  static flags = {
    env: Flags.string({
      required: true,
      options: ["development", "stage", "production"],
      default: process.env.NODE_ENV || "development",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ListChannels);

    const guild = Config.general("GUILD_ID", { env: flags.env as EnvSymbol });
    const token = Config.botToken("ADMIN", { env: flags.env as EnvSymbol });

    const res = await this.get(Routes.guildChannels(guild), token);

    const data = res.data as Array<any>;

    const arranged: { categories: any[]; channels: any[] } = data.reduce(
      (p, v) => {
        if (v.type === 4) {
          return { categories: [...p.categories, v], channels: p.channels };
        }
        if ((v.name as string).endsWith("apartment")) {
          return p;
        }
        return { categories: p.categories, channels: [...p.channels, v] };
      },
      { categories: [], channels: [] }
    );

    for (let i = 0; i < arranged.channels.length; i++) {
      const cat = arranged.categories.find(
        (c) => c.id === arranged.channels[i].parent_id
      );
      cat.channels ??= [];
      cat.channels.push(arranged.channels[i]);
    }

    const sortedCategories = arranged.categories.sort(
      (a, b) => a.position - b.position
    );

    const sorted = sortedCategories.map((c) => {
      c.channels ??= [];
      c.channels = c.channels.sort((a: any, b: any) => a.position - b.position);
      return c;
    });

    const formatPermissions = (p: any) => {
      let symbol: string | null;
      try {
        symbol = Config.reverseRoleId(p.id);
      } catch (e) {
        symbol = null;
      }

      return {
        id: symbol || p.id,
        type: p.type,
        allow: p.allow,
        deny: p.deny,
      };
    };

    const trimmed = sorted.map((c) => {
      return {
        name: c.name,
        permission_overwrites: c.permission_overwrites.map(formatPermissions),
        channels: c.channels.map((channel: any) => {
          return {
            name: channel.name,
            permission_overwrites: equal(
              c.permission_overwrites.sort(),
              channel.permission_overwrites.sort()
            )
              ? "LOCKED"
              : channel.permission_overwrites.map(formatPermissions),
          };
        }),
      };
    });

    console.log(render(trimmed));
  }
}
