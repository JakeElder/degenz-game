import Config from "config";
import {
  ApartmentTenancy,
  Dormitory,
  DormitoryTenancy,
  Imprisonment,
} from "data/db";
import { ChannelDescriptor } from "data/types";
import { TextBasedChannel } from "discord.js";
import { structure } from "manifest";
import memoize from "memoizee";

const [beautopia, entrance, joinTheGame, commandCenter, community] = [
  structure.find((c) => c.symbol === "BEAUTOPIA")!,
  structure.find((c) => c.symbol === "ENTRANCE")!,
  structure.find((c) => c.symbol === "JOIN_THE_GAME")!,
  structure.find((c) => c.symbol === "COMMAND_CENTER")!,
  structure.find((c) => c.symbol === "COMMUNITY")!,
];

const communityChannelIds = [
  ...entrance.channels,
  ...joinTheGame.channels,
  ...commandCenter.channels,
  ...community.channels,
].map((c) => Config.channelId(c.symbol));

const gameChannelIds = beautopia.channels.map((c) =>
  Config.channelId(c.symbol)
);

export class Channel {
  static getDescriptor = memoize(
    async (channelId: TextBasedChannel["id"]): Promise<ChannelDescriptor> => {
      const [imprisonment, apartmentTenancy, dormitoryTenancy, dormitory] =
        await Promise.all([
          Imprisonment.findOne({ where: { cellDiscordChannelId: channelId } }),
          ApartmentTenancy.findOne({ where: { discordChannelId: channelId } }),
          DormitoryTenancy.findOne({ where: { bunkThreadId: channelId } }),
          Dormitory.findOne({ where: { discordChannelId: channelId } }),
        ]);

      const isCommunity = communityChannelIds.includes(channelId);
      const isApartment = !!apartmentTenancy;
      const isDormitory = !!dormitory;
      const isBunk = !!dormitoryTenancy;
      const isCell = !!imprisonment;
      const isInPrison = isCell || channelId === Config.channelId("GEN_POP");
      const isInGame =
        isApartment ||
        isDormitory ||
        isBunk ||
        isInPrison ||
        gameChannelIds.includes(channelId);

      return {
        id: channelId,
        isCommunity,
        isApartment,
        isDormitory,
        isBunk,
        isCell,
        isInPrison,
        isInGame,
        isTossHouse: channelId === Config.channelId("TOSS_HOUSE"),
        isMart: channelId === Config.channelId("MART"),
        isBank: channelId === Config.channelId("BANK"),
      };
    },
    { promise: true, maxAge: 1000 * 60 * 10 }
  );
}
