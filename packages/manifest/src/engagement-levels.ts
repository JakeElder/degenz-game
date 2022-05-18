import { EngagementLevel } from "data/db";
import { RecursivePartial } from "data/types";

export const engagementLevels: RecursivePartial<EngagementLevel>[] = [
  { id: 1, emoji: { id: "POTATO_SACK" } },
  { id: 2, emoji: { id: "CUPCAKE" } },
  { id: 3, emoji: { id: "HOT_DOG" } },
  { id: 4, emoji: { id: "SUNSHINE" } },
  { id: 5, emoji: { id: "NICK_CAGE" } },
  { id: 6, emoji: { id: "CHICKEN" } },
  { id: 8, emoji: { id: "BULLISH" } },
  { id: 10, emoji: { id: "TIGER_BLOOD" } },
  { id: 15, emoji: { id: "T_REX" } },
  { id: 20, emoji: { id: "COOKIE_MONSTER" } },
  { id: 25, emoji: { id: "WEED_LEAF" } },
  { id: 30, emoji: { id: "FAT_CAT" } },
  { id: 35, emoji: { id: "BEARISH" } },
  { id: 40, emoji: { id: "SNAKEY_SAN" } },
  { id: 50, emoji: { id: "DRAGON" } },
];
