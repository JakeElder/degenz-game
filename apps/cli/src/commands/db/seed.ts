import Listr from "listr";
import {
  AppState,
  Achievement,
  District,
  MartItem,
  NPC,
  PersistentMessage,
  Dormitory,
} from "data/db";
import {
  Achievement as AchievementEnum,
  BotSymbolEnum,
  DistrictSymbol,
} from "data/types";
import { Command } from "../../lib";

export default class Seed extends Command {
  static description = "Seeds the database";

  async run(): Promise<void> {
    const listr = new Listr([
      {
        title: "Achievements",
        task: async () => {
          await Achievement.insert(
            Object.keys(AchievementEnum).map((k) => {
              return { symbol: k as AchievementEnum };
            })
          );
        },
      },
      {
        title: "App State",
        task: async () => {
          await AppState.insert({ dormitoryCapacity: 1 });
        },
      },
      {
        title: "Dormitories",
        task: async () => {
          await Dormitory.insert([
            { symbol: "BULLSEYE" },
            { symbol: "THE_GRID" },
            { symbol: "THE_LEFT" },
            { symbol: "THE_RIGHT" },
            { symbol: "VULTURE" },
          ]);
        },
      },
      {
        title: "Districts",
        task: async () => {
          await District.insert([
            {
              symbol: DistrictSymbol.PROJECTS_D1,
              allowance: 150,
            },
            {
              symbol: DistrictSymbol.PROJECTS_D2,
              allowance: 130,
            },
            {
              symbol: DistrictSymbol.PROJECTS_D3,
              allowance: 120,
            },
            {
              symbol: DistrictSymbol.PROJECTS_D4,
              allowance: 110,
            },
            {
              symbol: DistrictSymbol.PROJECTS_D5,
              allowance: 100,
            },
            {
              symbol: DistrictSymbol.PROJECTS_D6,
              allowance: 90,
            },
          ]);
        },
      },
      {
        title: "Mart Items",
        task: async () => {
          await MartItem.insert([
            {
              symbol: "PIZZA",
              name: "Fat Pizza \u00a9",
              description: "A slice of Fat Pizza",
              price: 25,
              stock: 10,
              strengthIncrease: 10,
            },
            {
              symbol: "NOODLES",
              name: "Degenz Brand Ramen Noodles \u00a9",
              description:
                "Luxurious instant noodles, complete with a packet of RatSpice.",
              price: 10,
              stock: 10,
              strengthIncrease: 4,
            },
            {
              symbol: "GRILLED_RAT",
              name: "Nuu Ping \u00a9",
              description:
                "Succulent rat meat, barbecue grilled to perfection.",
              price: 1,
              stock: 50,
              strengthIncrease: 1,
            },
          ]);
        },
      },
      {
        title: "NPC",
        task: async () => {
          await NPC.insert(
            Object.keys(BotSymbolEnum).map((k) => {
              return { symbol: k as BotSymbolEnum };
            })
          );
        },
      },
      {
        title: "Persistent Message",
        task: async () => {
          await PersistentMessage.insert([
            {
              symbol: "GBT_LEADERBOARD_1",
              channelSymbol: "LEADERBOARD",
              maintainerSymbol: "BIG_BROTHER",
            },
            {
              symbol: "GBT_LEADERBOARD_2",
              channelSymbol: "LEADERBOARD",
              maintainerSymbol: "BIG_BROTHER",
            },
            {
              symbol: "PLEDGE",
              channelSymbol: "HALL_OF_ALLEIGANCE",
              maintainerSymbol: "BIG_BROTHER",
            },
          ]);
        },
      },
    ]);

    await listr.run();
  }
}
