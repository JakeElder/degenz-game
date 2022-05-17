import { PersistentMessage } from "data/db";
import { RecursivePartial } from "data/types";

export const persistentMessages: RecursivePartial<PersistentMessage>[] = [
  {
    id: "ENTRANCE",
    channel: { id: "ENTRANCE" },
    maintainer: { id: "BIG_BROTHER" },
  },
  {
    id: "GBT_LEADERBOARD_1",
    channel: { id: "LEADERBOARD" },
    maintainer: { id: "BIG_BROTHER" },
  },
  {
    id: "GBT_LEADERBOARD_2",
    channel: { id: "LEADERBOARD" },
    maintainer: { id: "BIG_BROTHER" },
  },
  {
    id: "PLEDGE",
    channel: { id: "HALL_OF_ALLEIGANCE" },
    maintainer: { id: "BIG_BROTHER" },
  },
  {
    id: "SHOW_QUESTS",
    channel: { id: "QUESTS" },
    maintainer: { id: "ADMIN" },
  },
];
