import {
  ButtonInteraction,
  GuildMember,
  Message,
  TextBasedChannel,
} from "discord.js";

export default class Interaction {
  static async getProps(i: ButtonInteraction): Promise<{
    member: GuildMember;
    channel: TextBasedChannel;
    message: Message;
  }> {
    const [member, channel, message] = await Promise.all([
      await this.getMemberFromInteraction(i),
      await this.getChannelFromInteraction(i),
      await this.getMessageFromInteraction(i),
    ]);
    return { member, channel, message };
  }

  static async getMemberFromInteraction(
    i: ButtonInteraction
  ): Promise<GuildMember> {
    return i.member as GuildMember;
  }

  static async getMessageFromInteraction(
    i: ButtonInteraction
  ): Promise<Message> {
    if ("edit" in i.message) {
      return i.message;
    }
    const channel = await i.client.channels.fetch(i.channelId);
    if (!channel?.isText()) {
      throw new Error("Non text channel");
    }
    return channel.messages.fetch(i.message.id);
  }

  static async getChannelFromInteraction(
    i: ButtonInteraction
  ): Promise<TextBasedChannel> {
    if (i.channel) {
      return i.channel;
    }
    const channel = await i.client.channels.fetch(i.channelId);
    if (!channel || !channel.isText()) {
      throw new Error("Channel not found");
    }
    return channel;
  }
}
