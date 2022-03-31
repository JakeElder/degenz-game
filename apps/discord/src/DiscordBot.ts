import { Client, Guild, GuildMember, TextChannel } from "discord.js";
import { Bot } from "data/types";
import Config from "config";
import Events from "./Events";
import { CommandController } from "./CommandController";
import Utils from "./Utils";

export default abstract class DiscordBot {
  protected readyPromise: Promise<void>;
  private readyResolver!: (value: void | PromiseLike<void>) => void;
  client: Client;
  guild!: Guild;

  get ready() {
    return this.readyPromise;
  }

  constructor(public manifest: Bot, public controller: CommandController) {
    this.client = new Client(this.manifest.clientOptions);
    this.readyPromise = new Promise((resolve) => {
      this.readyResolver = resolve;
    });

    this.bindClientEvents();
    this.connect();
  }

  bindClientEvents() {
    this.client.on("rateLimit", (e) => {
      Utils.rollbar.info(
        `Rate Limited Request: \n\`\`\`${JSON.stringify(e, null, 2)}\`\`\``
      );
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
        this.manifest.symbol === "SCOUT"
          ? Config.general("PROD_GUILD_ID")
          : Config.general("GUILD_ID");

      this.guild = await this.client.guilds.fetch(guildId);
      this.readyResolver();
      Events.emit("BOT_READY", { bot: this.manifest });
    });
    this.client.login(Config.botToken(this.manifest.symbol));
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

  async getTextChannel(id: TextChannel["id"]): Promise<TextChannel> {
    const channel = await this.guild.channels.fetch(id);
    if (!channel) throw new Error(`Channel ${id} not found`);
    return channel as TextChannel;
  }
}
