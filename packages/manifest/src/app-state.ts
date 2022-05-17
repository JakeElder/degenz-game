import { AppState } from "data/db";
import { RecursivePartial } from "data/types";

export const appStates: RecursivePartial<AppState>[] = [
  {
    id: "CURRENT",
    dormitoryCapacity: 10,
    sheltersOpen: true,
    transferEnabled: false,
  },
];
