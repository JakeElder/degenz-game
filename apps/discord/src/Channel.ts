import Config from "config";
import { Channel as ChannelEntity } from "data/db";
import { ChannelDescriptor, NestedManagedChannelSymbol } from "data/types";
import { TextBasedChannel } from "discord.js";
import Manifest from "manifest";
import memoize from "memoizee";
import { Global } from "./Global";

export class Channel {
  static getDescriptor = memoize(
    async (channelId: TextBasedChannel["id"]): Promise<ChannelDescriptor> => {
      const { channels } = await Manifest.load();

      const [beautopia, theGame, commandCenter, community] = [
        channels.find((c) => c.id === "BEAUTOPIA"),
        channels.find((c) => c.id === "THE_GAME"),
        channels.find((c) => c.id === "COMMAND_CENTER"),
        channels.find((c) => c.id === "COMMUNITY"),
      ];

      if (!theGame || !commandCenter || !community || !beautopia) {
        throw new Error("Missing category");
      }

      const communityChannelIds = [
        ...theGame.children,
        ...commandCenter.children,
        ...community.children,
      ].map((c) => Config.channelId(c.id));

      const gameChannelIds = beautopia.children.map((c) =>
        Config.channelId(c.id as NestedManagedChannelSymbol)
      );

      const c = await ChannelEntity.findOneOrFail({ where: { id: channelId } });

      const admin = Global.bot("ADMIN");
      const channel = await admin.getTextChannel(channelId);

      const isCommunity = communityChannelIds.includes(channelId);
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
        gameChannelIds.includes(channelId);

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
