import { Client, Guild, GuildMember, TextChannel } from "discord.js";
import { Bot } from "types";
import Config from "app-config";
import Events from "./Events";
import { CommandController } from "./CommandController";

export default abstract class DiscordBot {
  protected readyPromise: Promise<void>;
  private readyResolver!: (value: void | PromiseLike<void>) => void;
  client: Client;
  guild!: Guild;

  constructor(public manifest: Bot, public controller: CommandController) {
    this.client = new Client(this.manifest.clientOptions);

    this.readyPromise = new Promise((resolve) => {
      this.readyResolver = resolve;
    });

    this.bindClientEvents();
    this.connect();
  }

  bindClientEvents() {
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
      this.guild = await this.client.guilds.fetch(Config.general("GUILD_ID"));
      this.readyResolver();
      Events.emit("BOT_READY", { bot: this.manifest });
    });
    this.client.login(Config.botToken(this.manifest.id));
    return this.readyPromise;
  }

  destroy() {
    this.client.destroy();
  }

  async getMember(id: GuildMember["id"]): Promise<GuildMember> {
    let member = this.guild.members.cache.get(id);
    if (member) return member;
    member = await this.guild.members.fetch(id);
    if (!member) throw new Error(`Member ${id} not found`);
    return member;
  }

  async getTextChannel(id: TextChannel["id"]): Promise<TextChannel> {
    let channel = this.guild.channels.cache.get(id) as any;
    if (channel) return channel as TextChannel;
    channel = await this.guild.channels.fetch(id);
    if (!channel) throw new Error(`Channel ${id} not found`);
    return channel as TextChannel;
  }
}
