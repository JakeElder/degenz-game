import Config from "config";
import { Channel as ChannelEntity } from "data/db";
import { ChannelDescriptor, ManagedChannelSymbol, NPCSymbol } from "data/types";
import { TextBasedChannel } from "discord.js";
import Manifest from "manifest";
import memoize from "memoizee";
import { Global } from "./Global";

export class Channel {
  static async get(
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

      const c = await ChannelEntity.findOneOrFail({ where: { id: channelId } });

      const admin = Global.bot("ADMIN");
      const channel = await admin.getTextChannel(channelId);

      const isCommunity = !!communityChannels.find((c) => c.id === channelId);
      const isApartment = c.type === "APARTMENT";
      const isDormitory = c.type === "DORMITORY";
      const isOnboardingThread = c.type === "ONBOARDING_THREAD";
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
        name: channel.name,
        channel,
        isCommunity,
        isApartment,
        isDormitory,
        isOnboardingThread,
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
