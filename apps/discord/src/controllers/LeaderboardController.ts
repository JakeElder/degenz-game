import { User } from "data/db";
import { PersistentMessageController } from "./PersistentMessageController";
import { GuildMember, MessageEmbedOptions } from "discord.js";
import { Format } from "lib";
import { table } from "table";
import truncate from "truncate";
import Config from "config";
import equal from "fast-deep-equal";
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
    const bot =
      Config.env("NODE_ENV") === "development" && Config.general("USE_SCOUT")
        ? Global.bot("SCOUT")
        : Global.bot("ADMIN");

    await bot.ready;

    const members = await bot.guild.members.fetch({
      user: leaders.map((l) => l.discordId),
    });

    const data: Leader[] = leaders.map((u) => {
      return {
        id: u.id,
        displayName: u.displayName,
        gbt: u.gbt,
        member: members.get(u.discordId)!,
      };
    });

    return data;
  }

  static makeEmbeds(leaders: Leader[]): MessageEmbedOptions[] {
    return leaders.map((l, idx) => this.makeEmbed(l, idx + 1));
  }

  static makeEmbed(l: Leader, position: number): MessageEmbedOptions {
    const avatar = (() => {
      const avatar = l.member.displayAvatarURL({ dynamic: true, size: 64 });
      return /\/\d\d?\.png$/.test(avatar)
        ? `${Config.env("WEB_URL")}/characters/generic-32px.png?v1`
        : avatar;
    })();

    return {
      color: "GOLD",
      author: {
        name: l.member.displayName,
        icon_url: `${Config.env("WEB_URL")}/numbers/number-${position}.png?v1`,
      },
      thumbnail: {
        url: avatar,
        height: 32,
        width: 32,
      },
      description: Format.codeBlock(
        `\u{1f4b0} ${`${Format.currency(l.gbt, {
          bare: true,
        })} ${Format.token()}`.padEnd(16, " ")}`
      ),
    };
  }

  static makeTable(leaders: Leader[], offset: number) {
    const s = [
      ...leaders.map((l, idx) => [
        `${(idx + offset + 1).toString().padStart(2, " ")}.${truncate(
          l.displayName,
          22 - 5 - 1
        )}`,
        ` ${Format.token()} ${Format.currency(l.gbt, { bare: true })}`,
      ]),
    ];

    const t = table(s, {
      drawVerticalLine: (idx) => [1].includes(idx),
      columnDefault: { paddingLeft: 0, paddingRight: 0 },
      drawHorizontalLine: () => false,
      columns: [{ width: 22 }, { width: 12, alignment: "left" }],
    });

    return t;
  }

  static async setMessage() {
    const leaders = await User.find({
      where: { inGame: true },
      order: { gbt: -1 },
      take: 30,
    });

    const tableData = [...leaders.map((l) => [l.displayName, l.gbt])];

    if (equal(this.tableData, tableData)) {
      return;
    }

    const data = await this.computeData(leaders);
    const top10 = data.slice(0, 10);

    if (top10.length) {
      await PersistentMessageController.set("GBT_LEADERBOARD_1", {
        embeds: this.makeEmbeds(top10),
      });
    }

    const rest = data.slice(10);

    if (rest.length) {
      await PersistentMessageController.set("GBT_LEADERBOARD_2", {
        content: Format.codeBlock(this.makeTable(rest, 10)),
      });
    }

    this.tableData = tableData;
  }
}
