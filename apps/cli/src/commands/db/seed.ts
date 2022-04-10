import { District, Dormitory, Emoji, NPC } from "data/db";
import { BotSymbolEnum, DistrictSymbolEnum, EntitySymbol } from "data/types";
import { ObjectType } from "typeorm";
import { BaseEntity } from "typeorm";
import { Command } from "../../lib";
import ProgressBar from "../../lib/ProgressBar";

type SeedableEntity = {
  symbol: EntitySymbol;
  entity: ObjectType<BaseEntity>;
  fn: () => Promise<void>;
};

export default class Seed extends Command {
  static description = "Seeds the database";

  async dormitories() {
    const emojis = await Emoji.find();
    const dormitories = Dormitory.create([
      {
        symbol: "BULLSEYE",
        emoji: emojis.find((e) => e.symbol === "BULLSEYE"),
        inactiveEmoji: emojis.find((e) => e.symbol === "BULLSEYE_INACTIVE"),
      },
      {
        symbol: "THE_GRID",
        emoji: emojis.find((e) => e.symbol === "THE_GRID"),
        inactiveEmoji: emojis.find((e) => e.symbol === "THE_GRID_INACTIVE"),
      },
      {
        symbol: "THE_LEFT",
        emoji: emojis.find((e) => e.symbol === "THE_LEFT"),
        inactiveEmoji: emojis.find((e) => e.symbol === "THE_LEFT_INACTIVE"),
      },
      {
        symbol: "THE_RIGHT",
        emoji: emojis.find((e) => e.symbol === "THE_RIGHT"),
        inactiveEmoji: emojis.find((e) => e.symbol === "THE_RIGHT_INACTIVE"),
      },
      {
        symbol: "VULTURE",
        emoji: emojis.find((e) => e.symbol === "VULTURE"),
        inactiveEmoji: emojis.find((e) => e.symbol === "VULTURE_INACTIVE"),
      },
    ]);

    await Dormitory.upsert(dormitories, ["symbol"]);
  }

  async npcs() {
    const emojis = await Emoji.find();
    const symbols = Object.keys(BotSymbolEnum) as `${BotSymbolEnum}`[];
    await NPC.upsert(
      symbols.map((symbol) => {
        return NPC.create({
          symbol: symbol,
          emoji: emojis.find((e) => e.symbol === `${symbol}_NPC`),
        });
      }),
      ["symbol"]
    );
  }

  async districts() {
    const emojis = await Emoji.find();
    const symbols = Object.keys(
      DistrictSymbolEnum
    ) as `${DistrictSymbolEnum}`[];
    await District.upsert(
      symbols.map((symbol) => {
        return District.create({
          symbol,
          emoji: emojis.find((e) => e.symbol === symbol),
        });
      }),
      ["symbol"]
    );
  }

  async run(): Promise<void> {
    const entities: SeedableEntity[] = [
      { symbol: "DORMITORY", entity: Dormitory, fn: this.dormitories },
      { symbol: "NPC", entity: NPC, fn: this.npcs },
      { symbol: "DISTRICT", entity: District, fn: this.districts },
    ];

    const progress = new ProgressBar<EntitySymbol>(
      entities.map((e) => e.symbol)
    );

    progress.start();

    await Promise.all(
      entities.map(async (e) => {
        await e.fn.apply(this);
        progress.complete(e.symbol);
      })
    );

    progress.stop();
  }
}
