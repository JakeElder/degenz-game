import Config from "config";
import {
  ApartmentTenancy,
  Dormitory,
  DormitoryTenancy,
  Imprisonment,
} from "data/db";
import { ChannelDescriptor } from "data/types";
import { TextBasedChannel } from "discord.js";
import Manifest from "manifest";
import memoize from "memoizee";
import { Global } from "./Global";

export class Channel {
  static getDescriptor = memoize(
    async (channelId: TextBasedChannel["id"]): Promise<ChannelDescriptor> => {
      const structure = await Manifest.structure();

      const [beautopia, theGame, commandCenter, community] = [
        structure.find((c) => c.symbol === "BEAUTOPIA")!,
        structure.find((c) => c.symbol === "THE_GAME")!,
        structure.find((c) => c.symbol === "COMMAND_CENTER")!,
        structure.find((c) => c.symbol === "COMMUNITY")!,
      ];

      const communityChannelIds = [
        ...theGame.channels,
        ...commandCenter.channels,
        ...community.channels,
      ].map((c) => Config.channelId(c.symbol));

      const gameChannelIds = beautopia.channels.map((c) =>
        Config.channelId(c.symbol)
      );

      const admin = Global.bot("ADMIN");
      const [
        imprisonment,
        apartmentTenancy,
        dormitoryTenancy,
        dormitory,
        channel,
      ] = await Promise.all([
        Imprisonment.findOne({ where: { cellDiscordChannelId: channelId } }),
        ApartmentTenancy.findOne({ where: { discordChannelId: channelId } }),
        DormitoryTenancy.findOne({ where: { onboardingThreadId: channelId } }),
        Dormitory.findOne({ where: { discordChannelId: channelId } }),
        admin.getTextChannel(channelId),
      ]);

      const isCommunity = communityChannelIds.includes(channelId);
      const isApartment = !!apartmentTenancy;
      const isDormitory = !!dormitory;
      const isOnboardingThread = !!dormitoryTenancy;
      const isCell = !!imprisonment;
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
