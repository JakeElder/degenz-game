import { CliUx } from "@oclif/core";
import { Routes } from "discord-api-types/v10";
import Listr from "listr";
import { Command } from "../../lib";
import _ from "discord.js";
import Config from "config";

export default class DeleteBunks extends Command {
  static description = "Delete bunks";

  async run(): Promise<void> {
    const { data: channels } = await this.get(
      Routes.guildChannels(Config.general("GUILD_ID")),
      Config.botToken("ADMIN")
    );

    const dormIds = [
      Config.channelId("THE_LEFT"),
      Config.channelId("THE_RIGHT"),
      Config.channelId("THE_GRID"),
      Config.channelId("BULLSEYE"),
      Config.channelId("VULTURE"),
    ];

    const dorms = channels.filter((c: any) => dormIds.includes(c.id));

    const [active, inactive] = await (async () => {
      const [
        {
          data: { threads: active },
        },
        inactive,
      ] = await Promise.all([
        this.get(
          Routes.guildActiveThreads(Config.general("GUILD_ID")),
          Config.botToken("ADMIN")
        ),
        (async () => {
          const threads = await Promise.all(
            dorms.map((d: any) => {
              return this.get(
                Routes.channelThreads(d.id, "private"),
                Config.botToken("ADMIN")
              );
            })
          );
          return threads.reduce((p, c) => {
            return [...p, ...c.data.threads];
          }, []);
        })(),
      ]);
      return [active, inactive];
    })();

    const t = [...active, ...inactive].filter((t) => t.name.endsWith("bunk"));
    console.log(t.map((t) => t.name));

    const cnfrm = await CliUx.ux.prompt(
      `Deleting ${t.length} channels. Are you sure? Y/n`
    );

    if (cnfrm !== "Y") {
      return;
    }

    const listr = new Listr(
      t.map((c: any) => {
        return {
          title: c.name,
          task: async (_, task) => {
            await this.delete(
              Routes.channel(c.id),
              Config.botToken("ADMIN"),
              task
            );
          },
        } as Listr.ListrTask;
      }),
      { concurrent: true }
    );

    await listr.run();
  }
}
