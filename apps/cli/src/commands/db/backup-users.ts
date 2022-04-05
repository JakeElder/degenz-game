import { MartItemOwnership, User } from "data/db";
import { Command } from "../../lib";
import { classToPlain } from "class-transformer";

export default class Seed extends Command {
  static description = "Seeds the database";

  async run(): Promise<void> {
    const users = await User.find({
      relations: [
        "tenancies",
        "tenancies.district",
        "imprisonments",
        "achievements",
        "pledges",
        "playerEvents",
      ],
    });

    const withItems = await Promise.all(
      users.map(async (u) => {
        const mi = await MartItemOwnership.find({ user: u });
        u.martItemOwnerships = mi;
        return classToPlain(u);
      })
    );

    console.log(JSON.stringify(withItems, null, 2));
  }
}
