import { Client, Guild, GuildMember } from "discord.js";
import { NPC } from "data/db";
import Config from "config";
import Events from "./Events";
import { CommandController } from "./CommandController";
import Analytics from "./Analytics";
import delay from "delay";

export default abstract class DiscordBot {
  protected readyPromise: Promise<void>;
  private readyResolver!: (value: void | PromiseLike<void>) => void;
  client: Client;
  guild!: Guild;

  get ready() {
    return this.readyPromise;
  }

  constructor(public npc: NPC, public controller: CommandController) {
    this.client = new Client(this.npc.clientOptions);
    this.readyPromise = new Promise((resolve) => {
      this.readyResolver = resolve;
    });

    this.bindClientEvents();
    this.connect();
  }

  bindClientEvents() {
    this.client.on("rateLimit", (e) => {
      Analytics.mixpanel.track("Rate Limited", {
        guild_id: Config.env("GUILD_ID"),
        env: Config.env("NODE_ENV"),
        distinct_id: "APP",
        ...e,
      });
    });

    this.client.on("interactionCreate", async (i) => {
      if (i.isSelectMenu()) {
        this.controller.handleSelect(i);
      }

      if (i.isCommand()) {
        this.controller.execute(i, this);
      }
    });
  }

  private connect() {
    this.client.once("ready", async () => {
      const guildId =
        this.npc.id === "SCOUT"
          ? Config.general("PROD_GUILD_ID")
          : Config.env("GUILD_ID");

      this.guild = await this.client.guilds.fetch(guildId);
      this.readyResolver();
      Events.emit("BOT_READY", { bot: this.npc });
    });
    this.client.login(Config.botToken(this.npc.id));
    return this.readyPromise;
  }

  destroy() {
    this.client.destroy();
  }

  async getMember(id: GuildMember["id"]): Promise<GuildMember | null> {
    let member = this.guild.members.cache.get(id);
    if (member) return member;
    try {
      member = await this.guild.members.fetch(id);
    } catch (e) {
      return null;
    }
    return member;
  }
}
