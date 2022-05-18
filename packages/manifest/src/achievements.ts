import { Achievement } from "data/db";
import { RecursivePartial } from "data/types";

export const achievements: RecursivePartial<Achievement>[] = [
  { id: "JOIN_THE_DEGENZ_QUEST_COMPLETED" },
  { id: "PLEDGE_QUEST_COMPLETED" },
  { id: "LEARN_TO_HACKER_BATTLE_QUEST_COMPLETED" },
  { id: "TOSS_WITH_TED_QUEST_COMPLETED" },
  { id: "SHOP_AT_MERRIS_MART_QUEST_COMPLETED" },
  { id: "GET_WHITELIST_QUEST_COMPLETED" },
  { id: "HELP_REQUESTED" },
  { id: "STATS_CHECKED" },
  { id: "FINISHED_TRAINER" },
  { id: "LEVEL_1_REACHED", reward: 200 },
  { id: "LEVEL_2_REACHED", reward: 400 },
  { id: "LEVEL_3_REACHED", reward: 600 },
  { id: "LEVEL_4_REACHED", reward: 800 },
  { id: "LEVEL_5_REACHED", reward: 1000 },
  { id: "LEVEL_6_REACHED", reward: 1500 },
  { id: "LEVEL_8_REACHED", reward: 2000 },
  { id: "LEVEL_10_REACHED", reward: 3000 },
  { id: "LEVEL_15_REACHED", reward: 5000 },
  { id: "LEVEL_20_REACHED", reward: 10_000 },
  { id: "LEVEL_25_REACHED", reward: 15_000 },
  { id: "LEVEL_30_REACHED", reward: 20_000 },
  { id: "LEVEL_35_REACHED", reward: 30_000 },
  { id: "LEVEL_40_REACHED", reward: 40_000 },
  { id: "LEVEL_50_REACHED", reward: 50_000 },
];
