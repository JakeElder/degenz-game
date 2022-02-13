import {
  Client,
  CommandInteraction,
  Guild,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Bot } from "types";
import Config from "app-config";

// const pe = new PrettyError();

// export type DiscordBotEvents = {
//   READY: () => void;
//   WORLD_EVENT: (data: WorldEventMessage) => void;
// };

export default abstract class DiscordBot {
  protected readyPromise!: Promise<void>;
  client: Client;
  guild!: Guild;

  constructor(public manifest: Bot) {
    this.client = new Client(this.manifest.clientOptions);

    this.readyPromise = new Promise((resolve) => {
      resolve();
      // this.on("READY", resolve);
    });

    this.bindClientEvents();
    this.connect();
  }

  bindClientEvents() {
    this.client.on("interactionCreate", async (i) => {
      if (!i.isCommand()) return;
      this.handleCommand(i);
    });
  }

  private connect() {
    this.client.once("ready", async () => {
      this.guild = await this.client.guilds.fetch(Config.general("GUILD_ID"));
      console.log("ready", this.guild);
      // this.emit("READY");
      // this.log("Ready");
    });
    this.client.login(Config.botToken(this.manifest.id));
    return this.readyPromise;
  }

  async handleCommand(i: CommandInteraction) {
    // if (!command) {
    //   this.error("COMMAND_NOT_FOUND");
    //   return;
    // }

    try {
      // await command.execute.call(this, i);
    } catch (e) {
      // rollbar.error(e as Error);
      // console.error(pe.render(e as Error));
      // if (i.deferred || i.replied) {
      //   await i.editReply({ content: "Error" });
      // } else {
      //   await i.reply({ content: "Error", ephemeral: true });
      // }
    }
  }

  destroy() {
    // this.log("Shutting down");
    this.client.destroy();
  }

  async getMember(id: GuildMember["id"]): Promise<GuildMember> {
    let member = this.guild.members.cache.get(id);
    if (member) return member;
    member = await this.guild.members.fetch(id);
    if (!member) throw new Error(`Member ${id} not found`);
    return member;
  }

  protected async getTextChannel(id: TextChannel["id"]): Promise<TextChannel> {
    let channel = this.guild.channels.cache.get(id) as any;
    if (channel) return channel as TextChannel;
    channel = await this.guild.channels.fetch(id);
    if (!channel) throw new Error(`Channel ${id} not found`);
    return channel as TextChannel;
  }
}
