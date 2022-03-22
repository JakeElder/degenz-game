import { Routes } from "discord-api-types/v9";
import { bots } from "manifest";
import Listr from "listr";
import Config from "config";
import { promises as fs } from "fs";
import path from "path";
import { snakeCase } from "change-case";
import { NPC, connect, disconnect, District, Dormitory } from "data/db";
import { Command } from "../../lib";

async function exists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export default class DeployEmojis extends Command {
  static description = "Deploy emojis";

  async run(): Promise<void> {
    const guildId = Config.general("GUILD_ID");

    await connect();
    const districts = await District.find({ order: { symbol: 1 } });
    const dormitories = await Dormitory.find({ order: { symbol: 1 } });

    const listr = new Listr(
      [
        {
          title: "Dormitories",
          task: () => {
            return new Listr(
              dormitories.map((d) => {
                return {
                  title: d.symbol,
                  task: async () => {
                    return new Listr(
                      ["active", "inactive"].map<Listr.ListrTask>((i) => {
                        return {
                          title: i,
                          task: async (_, task) => {
                            if (d.inactiveEmoji && d.activeEmoji) {
                              task.skip(
                                `Emojis already uploaded for ${d.symbol}`
                              );
                              return;
                            }
                            const name = d.symbol.toLowerCase();
                            const variant = i === "active" ? "" : "_i";
                            const file = path.join(
                              __dirname,
                              `../../images/dormitory/${name}${variant}.png`
                            );
                            const iconExists = await exists(file);

                            if (!iconExists) {
                              throw new Error(`No ${i} icon for ${d.symbol}`);
                            }

                            const icon = await fs.readFile(file, {
                              encoding: "base64",
                            });

                            const res = await this.post(
                              Routes.guildEmojis(guildId),
                              {
                                name: `${name}${variant}`,
                                image: `data:image/png;base64,${icon}`,
                                roles: [Config.roleId("EVERYONE")],
                              },
                              Config.botToken("ADMIN"),
                              task
                            );

                            if (res.status >= 200 && res.status < 300) {
                              d[
                                variant === "_i"
                                  ? "inactiveEmoji"
                                  : "activeEmoji"
                              ] = `<:${name}${variant}:${res.data.id}>`;
                              await d.save();
                            } else {
                              throw new Error(res.statusText);
                            }
                          },
                        };
                      })
                    );
                  },
                };
              }),
              { exitOnError: false }
            );
          },
        },
        {
          title: "Districts",
          task: () => {
            return new Listr(
              districts.map((d) => {
                return {
                  title: d.symbol,
                  task: async () => {
                    return new Listr(
                      ["active", "inactive"].map<Listr.ListrTask>((i) => {
                        return {
                          title: i,
                          task: async (_, task) => {
                            if (d.inactiveEmoji && d.activeEmoji) {
                              task.skip(
                                `Emojis already uploaded for ${d.symbol}`
                              );
                              return;
                            }
                            const name = d.symbol.split("_")[1];
                            const variant = i === "active" ? "A" : "I";
                            const file = path.join(
                              __dirname,
                              `../../images/district/${name}${variant}.png`
                            );

                            const iconExists = await exists(file);

                            if (!iconExists) {
                              throw new Error(`No ${i} icon for ${d.symbol}`);
                            }

                            const icon = await fs.readFile(file, {
                              encoding: "base64",
                            });

                            const res = await this.post(
                              Routes.guildEmojis(guildId),
                              {
                                name: `${name}${variant}`,
                                image: `data:image/jpeg;base64,${icon}`,
                                roles: [Config.roleId("EVERYONE")],
                              },
                              Config.botToken("ADMIN"),
                              task
                            );

                            if (res.status >= 200 && res.status < 300) {
                              d[
                                variant === "I"
                                  ? "inactiveEmoji"
                                  : "activeEmoji"
                              ] = `<:${name}${variant}:${res.data.id}>`;
                              await d.save();
                            } else {
                              throw new Error(res.statusText);
                            }
                          },
                        };
                      })
                    );
                  },
                };
              }),
              { exitOnError: false }
            );
          },
        },
        {
          title: "NPCs",
          task: () => {
            return new Listr(
              bots.map<Listr.ListrTask>((bot) => {
                return {
                  title: bot.name,
                  task: async (_, task) => {
                    const npc = await NPC.findOneOrFail({ symbol: bot.symbol });
                    if (npc.defaultEmojiId) {
                      task.skip(`Emojis already uploaded for ${npc.symbol}`);
                      return;
                    }

                    const name = snakeCase(bot.name);
                    const f = path.join(
                      __dirname,
                      `../../images/npcs/${name}.png`
                    );

                    if (!(await exists(f))) {
                      task.skip(`No icon for ${bot.name}`);
                      return;
                    }

                    const c = await fs.readFile(f, { encoding: "base64" });

                    const res = await this.post(
                      Routes.guildEmojis(guildId),
                      {
                        name,
                        image: `data:image/jpeg;base64,${c}`,
                        roles: [Config.roleId("EVERYONE")],
                      },
                      Config.botToken("ADMIN"),
                      task
                    );

                    if (res.status >= 200 && res.status < 300) {
                      await NPC.update(
                        { symbol: bot.symbol },
                        { defaultEmojiId: `<:${name}:${res.data.id}>` }
                      );
                    }
                  },
                };
              }),
              { exitOnError: false }
            );
          },
        },
      ],
      { exitOnError: false, collapse: false } as any
    );

    await listr.run();
    await disconnect();
  }
}
