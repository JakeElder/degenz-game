import { Command } from "../../lib";
import { Pledge } from "data/src";
import humanizeDuration from "humanize-duration";
import chalk from "chalk";

export default class DiffPledge extends Command {
  static description = "Diff Pledges";

  async run(): Promise<void> {
    // const admin = await this.bot("ADMIN");

    const pledges = await Pledge.findBy({ user: { id: "720619989618393121" } });

    for (let i = 0; i < pledges.length; i++) {
      const dur =
        i === 0
          ? "--"
          : humanizeDuration(
              pledges[i].createdAt.getTime() -
                pledges[i - 1].createdAt.getTime()
            );

      console.log(
        `[${i + 1}] ${chalk.yellow(`${pledges[i].yld} $GBT`)} ${chalk.grey(
          `[${pledges[i].createdAt.toLocaleString("en-GB")}]`
        )} ${chalk.blue(`+${dur}`)}`
      );
    }
  }
}
