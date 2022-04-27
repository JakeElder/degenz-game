import { AppState } from "data/db";

export const appStates = AppState.create([
  {
    id: "CURRENT",
    dormitoryCapacity: 10,
    sheltersOpen: true,
    transferEnabled: false,
  },
]);
