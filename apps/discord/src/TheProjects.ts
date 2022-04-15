import Config from "config";
import { District, Emoji } from "data/db";
import { DistrictSymbol } from "data/types";

type DistrictViewModel = {
  symbol: DistrictSymbol;
  tenancies: number;
  capacity: number;
  open: boolean;
  available: boolean;
  emoji: Emoji;
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
      order: { id: 1 },
    });

    const computedDistricts: ProjectsEntryData["districts"] = districts.map(
      (d) => {
        const available = d.open && d.tenancies.length < capacity;
        return {
          open: d.open,
          symbol: d.id,
          tenancies: d.tenancies.length,
          capacity: capacity - d.tenancies.length,
          available,
          emoji: d.emoji,
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
    return `${d.emoji} => ${
      d.open
        ? `\` [OPEN] \` => \`${d.capacity}/${capacity} available\``
        : `\`[CLOSED]\` => \`${d.capacity}/${capacity} available\``
    }`;
  }
}
