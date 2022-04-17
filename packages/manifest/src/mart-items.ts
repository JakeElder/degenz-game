import { MartItem } from "data/db";

export const martItems = MartItem.create([
  {
    id: "PIZZA",
    name: "Fat Pizza ©",
    description: "A slice of Fat Pizza",
    price: 25,
    strengthIncrease: 10,
    emoji: { id: "FAT_PIZZA" },
  },
  {
    id: "NOODLES",
    name: "Degenz Brand Ramen Noodles ©",
    description:
      "Luxurious instant noodles, complete with a packet of RatSpice.",
    price: 10,
    strengthIncrease: 4,
    emoji: { id: "DEGENZ_RAMEN" },
  },
  {
    id: "GRILLED_RAT",
    name: "Nuu Ping ©",
    description: "Succulent rat meat, barbecue grilled to perfection.",
    price: 1,
    strengthIncrease: 1,
    emoji: { id: "NUU_PING" },
  },
]);
