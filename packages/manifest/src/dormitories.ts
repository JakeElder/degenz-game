import { Dormitory } from "data/db";

export const dormitories = Dormitory.create([
  {
    id: "BULLSEYE",
    emoji: { id: "BULLSEYE" },
    inactiveEmoji: { id: "BULLSEYE_INACTIVE" },
    channel: { id: "BULLSEYE" },
    citizenRole: { id: "BULLSEYE_CITIZEN" },
  },
  {
    id: "THE_GRID",
    emoji: { id: "THE_GRID" },
    inactiveEmoji: { id: "THE_GRID" },
    channel: { id: "THE_GRID" },
    citizenRole: { id: "THE_GRID_CITIZEN" },
  },
  {
    id: "THE_LEFT",
    emoji: { id: "THE_LEFT" },
    inactiveEmoji: { id: "THE_LEFT_INACTIVE" },
    channel: { id: "THE_LEFT" },
    citizenRole: { id: "THE_LEFT_CITIZEN" },
  },
  {
    id: "THE_RIGHT",
    emoji: { id: "THE_RIGHT" },
    inactiveEmoji: { id: "THE_RIGHT" },
    channel: { id: "THE_RIGHT" },
    citizenRole: { id: "THE_RIGHT_CITIZEN" },
  },
  {
    id: "VULTURE",
    emoji: { id: "VULTURE" },
    inactiveEmoji: { id: "VULTURE" },
    channel: { id: "VULTURE" },
    citizenRole: { id: "VULTURE_CITIZEN" },
  },
]);
