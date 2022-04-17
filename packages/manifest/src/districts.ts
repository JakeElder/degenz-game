import { District } from "data/db";

export const districts = District.create([
  {
    id: "D1",
    allowance: 150,
    emoji: { id: "D1" },
    citizenRole: { id: "D1_CITIZEN" },
  },
  {
    id: "D2",
    allowance: 130,
    emoji: { id: "D2" },
    citizenRole: { id: "D2_CITIZEN" },
  },
  {
    id: "D3",
    allowance: 120,
    emoji: { id: "D3" },
    citizenRole: { id: "D3_CITIZEN" },
  },
  {
    id: "D4",
    allowance: 110,
    emoji: { id: "D4" },
    citizenRole: { id: "D4_CITIZEN" },
  },
  {
    id: "D5",
    allowance: 100,
    emoji: { id: "D5" },
    citizenRole: { id: "D5_CITIZEN" },
  },
  {
    id: "D6",
    allowance: 90,
    emoji: { id: "D6" },
    citizenRole: { id: "D6_CITIZEN" },
  },
]);
