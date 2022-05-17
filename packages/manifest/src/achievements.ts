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
  { id: "LEVEL_10_REACHED", reward: 5000 },
  { id: "LEVEL_8_REACHED", reward: 2500 },
  { id: "LEVEL_6_REACHED", reward: 1000 },
  { id: "LEVEL_4_REACHED", reward: 500 },
  { id: "LEVEL_2_REACHED", reward: 250 },
];
