import { EngagementLevel } from "data/db";
import { RecursivePartial } from "data/types";

export const engagementLevels: RecursivePartial<EngagementLevel>[] = [
  {
    id: 1,
    emoji: { id: "POTATO_SACK" },
    achievement: { id: "LEVEL_1_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_1" },
  },
  {
    id: 2,
    emoji: { id: "CUPCAKE" },
    achievement: { id: "LEVEL_2_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_2" },
  },
  {
    id: 3,
    emoji: { id: "HOT_DOG" },
    achievement: { id: "LEVEL_3_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_3" },
  },
  {
    id: 4,
    emoji: { id: "SUNSHINE" },
    achievement: { id: "LEVEL_4_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_4" },
  },
  {
    id: 5,
    emoji: { id: "NICK_CAGE" },
    achievement: { id: "LEVEL_5_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_5" },
  },
  {
    id: 6,
    emoji: { id: "CHICKEN" },
    achievement: { id: "LEVEL_6_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_6" },
  },
  {
    id: 8,
    emoji: { id: "BULLISH" },
    achievement: { id: "LEVEL_8_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_8" },
  },
  {
    id: 10,
    emoji: { id: "TIGER_BLOOD" },
    achievement: { id: "LEVEL_10_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_10" },
  },
  {
    id: 15,
    emoji: { id: "T_REX" },
    achievement: { id: "LEVEL_15_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_15" },
  },
  {
    id: 20,
    emoji: { id: "COOKIE_MONSTER" },
    achievement: { id: "LEVEL_20_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_20" },
  },
  {
    id: 25,
    emoji: { id: "WEED_LEAF" },
    achievement: { id: "LEVEL_25_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_25" },
  },
  {
    id: 30,
    emoji: { id: "FAT_CAT" },
    achievement: { id: "LEVEL_30_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_30" },
  },
  {
    id: 35,
    emoji: { id: "BEARISH" },
    achievement: { id: "LEVEL_35_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_35" },
  },
  {
    id: 40,
    emoji: { id: "SNAKEY_SAN" },
    achievement: { id: "LEVEL_40_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_40" },
  },
  {
    id: 50,
    emoji: { id: "DRAGON" },
    achievement: { id: "LEVEL_50_REACHED" },
    role: { id: "ENGAGEMENT_LEVEL_50" },
  },
];
