import { Command } from "../../lib";
import { MartItem } from "data/db";
import prompts, { PromptObject } from "prompts";
import { MartItemSymbol } from "data/types";

export default class RestockMartItems extends Command {
  static description = "Restock mart items";

  async run(): Promise<void> {
    const martItems = await MartItem.find();

    const what = await prompts([
      {
        name: "items",
        type: "multiselect",
        message: "Restock what?",
        choices: martItems.map((d) => ({ title: d.id, value: d.id })),
      },
    ]);

    const amount = await prompts(
      what.items.map((e: MartItemSymbol) => {
        const item = martItems.find((i) => i.id == e)!;
        return {
          name: e,
          type: "number",
          message: item.name,
        } as PromptObject;
      })
    );

    for (let i = 0; i < what.items.length; i++) {
      const item = martItems.find((mi) => mi.id == what.items[i])!;
      item.stock = amount[what.items[i]];
    }

    await MartItem.save(martItems);

    this.done();
  }
}
