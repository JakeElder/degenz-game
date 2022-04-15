import { AppState, Dormitory, Emoji } from "data/db";
import { DormitorySymbol } from "data/types";

export type DormitoryViewModel = {
  symbol: DormitorySymbol;
  capacity: number;
  tenancies: number;
  available: boolean;
  tableEmoji: Emoji;
};

export type SheltersEntryData = {
  open: boolean;
  dormitoryCapacity: number;
  dormitories: DormitoryViewModel[];
};

export default class TheShelters {
  static async computeEntryData(): Promise<SheltersEntryData> {
    const [state, dormitories] = await Promise.all([
      AppState.fetch(),
      Dormitory.find({
        relations: ["tenancies"],
        order: { id: 1 },
      }),
    ]);

    const computedDormitories: SheltersEntryData["dormitories"] =
      dormitories.map((d) => {
        const available = state.dormitoryCapacity > d.tenancies.length;
        return {
          symbol: d.id,
          capacity: state.dormitoryCapacity - d.tenancies.length,
          tenancies: d.tenancies.length,
          available,
          tableEmoji:
            state.sheltersOpen && available ? d.emoji : d.inactiveEmoji,
        };
      });

    return {
      dormitoryCapacity: state.dormitoryCapacity,
      open: state.sheltersOpen && computedDormitories.some((d) => d.available),
      dormitories: computedDormitories,
    };
  }

  static makeTableRows(data: SheltersEntryData) {
    const longestLength = data.dormitories
      .slice()
      .sort((a, b) => b.symbol.length - a.symbol.length)[0].symbol.length;

    return data.dormitories.map((d) => {
      const symbol = d.symbol.padEnd(longestLength);
      const availability = `\`${d.capacity}/${data.dormitoryCapacity} available\``;
      return `${d.tableEmoji} \`${symbol}\` => ${availability}`;
    });
  }
}
