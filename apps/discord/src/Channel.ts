import Config from "config";
import { DiscordChannel } from "data/db";
import { ChannelDescriptor, ManagedChannelSymbol, NPCSymbol } from "data/types";
import { TextBasedChannel } from "discord.js";
import Manifest from "manifest";
import memoize from "memoizee";
import { Global } from "./Global";

export class Channel {
  static async getOrFail(
    id: ManagedChannelSymbol | TextBasedChannel["id"],
    botSymbol: NPCSymbol = "ADMIN"
  ) {
    const bot = Global.bot(botSymbol);
    const channel = await bot.guild.channels.fetch(id);

    if (!channel || channel.type !== "GUILD_TEXT") {
      throw new Error(`Channel ${id} not found.`);
    }

    return channel;
  }

  static async get(
    id: ManagedChannelSymbol | TextBasedChannel["id"],
    botSymbol: NPCSymbol = "ADMIN"
  ) {
    const bot = Global.bot(botSymbol);
    let channel: TextBasedChannel | undefined;

    try {
      channel = (await bot.guild.channels.fetch(id)) as
        | TextBasedChannel
        | undefined;
    } catch (e) {}

    if (channel && (channel.type === "DM" || channel.type === "GUILD_NEWS")) {
      throw new Error(`Channel ${id} not found.`);
    }

    return channel;
  }

  static getDescriptor = memoize(
    async (channelId: TextBasedChannel["id"]): Promise<ChannelDescriptor> => {
      const { channels } = await Manifest.load();

      const communityCategoryIds: ManagedChannelSymbol[] = [
        "THE_GAME",
        "COMMAND_CENTER",
        "COMMUNITY",
      ];

      const communityChannels = channels.filter((c) =>
        communityCategoryIds.includes(c.parent?.id)
      );

      const gameChannels = channels.filter((c) => c.parent?.id === "BEAUTOPIA");

      const c = await DiscordChannel.findOneOrFail({
        where: { id: channelId },
      });

      const channel = await this.get(channelId);

      const isCommunity = !!communityChannels.find((c) => c.id === channelId);
      const isApartment = c.type === "APARTMENT";
      const isDormitory = c.type === "DORMITORY";
      const isOnboardingThread = c.type === "ONBOARDING_THREAD";
      const isQuestLogThread = c.type === "QUEST_LOG_THREAD";
      const isCell = c.type === "CELL";
      const isInPrison = isCell || channelId === Config.channelId("GEN_POP");
      const isInGame =
        isApartment ||
        isDormitory ||
        isOnboardingThread ||
        isInPrison ||
        !!gameChannels.find((c) => c.id === channelId);

      return {
        id: channelId,
        name: channel?.name,
        channel,
        isCommunity,
        isApartment,
        isDormitory,
        isOnboardingThread,
        isQuestLogThread,
        isCell,
        isInPrison,
        isInGame,
        isTossHouse: channelId === Config.channelId("TOSS_HOUSE"),
        isTownSquare: channelId === Config.channelId("TOWN_SQUARE"),
        isArena: channelId === Config.channelId("ARENA"),
        isMart: channelId === Config.channelId("MART"),
        isArmory: channelId === Config.channelId("ARMORY"),
        isTrainingDojo: channelId === Config.channelId("TRAINING_DOJO"),
        isGenPop: channelId === Config.channelId("GEN_POP"),
        isBank: channelId === Config.channelId("BANK"),
        isTavern: channelId === Config.channelId("TAVERN"),
      };
    },
    { promise: true, maxAge: 1000 * 60 * 10 }
  );
}
