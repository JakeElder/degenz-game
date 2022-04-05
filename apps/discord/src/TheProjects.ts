import Config from "config";
import { District } from "data/db";
import { DistrictSymbol } from "data/types";

type DistrictViewModel = {
  symbol: DistrictSymbol;
  tenancies: number;
  capacity: number;
  open: boolean;
  available: boolean;
  tableEmoji: string;
  buttonEmoji: string;
};

export type ProjectsEntryData = {
  open: boolean;
  capacity: number;
  districts: DistrictViewModel[];
};

export default class TheProjects {
  static async computeEntryData(): Promise<ProjectsEntryData> {
    const capacity = Config.general("DISTRICT_CAPACITY");

    const districts = await District.find({
      relations: ["tenancies"],
      order: { symbol: 1 },
    });

    const computedDistricts: ProjectsEntryData["districts"] = districts.map(
      (d) => {
        const available = d.open && d.tenancies.length < capacity;
        return {
          open: d.open,
          symbol: d.symbol,
          tenancies: d.tenancies.length,
          capacity: capacity - d.tenancies.length,
          available,
          tableEmoji: d.open ? d.activeEmoji : d.inactiveEmoji,
          buttonEmoji: available ? d.activeEmoji : d.inactiveEmoji,
        };
      }
    );

    return {
      open: computedDistricts.some((d) => d.available),
      capacity,
      districts: computedDistricts,
    };
  }

  static makeTableRow(
    capacity: ProjectsEntryData["capacity"],
    d: DistrictViewModel
  ) {
    return `${d.tableEmoji} => ${
      d.open
        ? `\` [OPEN] \` => \`${d.capacity}/${capacity} available\``
        : `\`[CLOSED]\` => \`${d.capacity}/${capacity} available\``
    }`;
  }
}
