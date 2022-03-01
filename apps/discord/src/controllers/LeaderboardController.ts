import equal from "fast-deep-equal";
import { User } from "data/db";
import { getLeaders } from "../legacy/db";
import { PersistentMessageController } from "./PersistentMessageController";
import { GuildMember, MessageEmbedOptions } from "discord.js";
import { Format } from "lib";
import { table } from "table";
import truncate from "truncate";
import { Global } from "../Global";

type Leader = {
  id: User["id"];
  displayName: User["displayName"];
  gbt: User["gbt"];
  member: GuildMember;
};

type LeaderboardData = Leader[];

export class LeaderboardController {
  static cronInterval: NodeJS.Timer;
  static tableData: any = [];

  static async init() {
    await this.update();
    this.cronInterval = setInterval(() => this.update(), 1000);
  }

  static async update() {
    await this.setMessage();
  }

  static async computeData(leaders: User[]): Promise<LeaderboardData> {
    const bb = Global.bot("BIG_BROTHER");
    const members = await Promise.all(
      leaders.map((u) => bb.getMember(u.discordId))
    );

    return leaders.map((u, idx) => ({
      id: u.id,
      displayName: u.displayName,
      gbt: u.gbt,
      member: members[idx],
    }));
  }

  static makeEmbed(l: Leader, position: number): MessageEmbedOptions {
    const s = [
      [
        `${position.toString().padStart(2, " ")}.${truncate(
          l.displayName,
          22 - 4 - 1
        )}`,
        ` ${Format.token()} ${Format.currency(l.gbt, { bare: true })}`,
      ],
    ];

    const row = table(s, {
      drawVerticalLine: (idx) => [1].includes(idx),
      columnDefault: { paddingLeft: 0, paddingRight: 0 },
      drawHorizontalLine: () => false,
      columns: [{ width: 22 }, { width: 11, alignment: "right" }],
    });

    return {
      thumbnail: {
        height: 32,
        width: 32,
        url: l.member.displayAvatarURL({ dynamic: true, size: 32 }),
      },
      description: Format.codeBlock(row),
    };
  }

  static async setMessage() {
    const leaders = await getLeaders();
    const tableData = [...leaders.map((l) => [l.displayName, l.gbt])];

    if (equal(this.tableData, tableData)) {
      return;
    }

    const data = await this.computeData(leaders);

    await PersistentMessageController.set("GBT_LEADERBOARD_1", {
      embeds: data.map((l, idx) => this.makeEmbed(l, idx + 1)),
    });

    // PersistentMessageController.set("GBT_LEADERBOARD_2", {
    //   embeds: [makeLeaderboardEmbed(leaders)],
    // });

    this.tableData = tableData;
  }
}
