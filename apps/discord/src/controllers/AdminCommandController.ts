import { CommandInteraction, GuildBasedChannel, GuildMember } from "discord.js";
import Config from "app-config";
import { bots } from "manifest";
import Events from "../Events";
import { issueTokens } from "../legacy/db";
import UserController from "./UserController";
import { CommandController } from "../CommandController";
import Runner from "../Runner";
import { DistrictId } from "types";
import AppController from "./AppController";

export default class AllyCommandController extends CommandController {
  async respond(
    i: CommandInteraction,
    content: string,
    type: "SUCCESS" | "FAIL" | "NEUTRAL" = "NEUTRAL"
  ) {
    const prefix = {
      SUCCESS: "\u2705 ",
      FAIL: "\u26a0\ufe0f ",
      NEUTRAL: "",
    }[type];

    content = `${prefix}\`${content}\``;

    return i.deferred || i.replied
      ? i.editReply({ content })
      : i.reply({ content, ephemeral: true });
  }

  async admin_initiate(i: CommandInteraction, runner: Runner) {
    const admin = runner.get("ADMIN");

    await i.deferReply({ ephemeral: true });

    const onboard = i.options.getBoolean("onboard");
    const district = i.options.getString("district") as DistrictId;
    const member = i.options.getMember("member", true) as GuildMember;

    const result = await UserController.init(
      member.id,
      onboard === null || onboard ? true : false,
      district,
      admin,
      runner.get("BIG_BROTHER")
    );

    return this.respond(i, result.code, result.success ? "SUCCESS" : "FAIL");
  }

  async admin_eject(i: CommandInteraction, runner: Runner) {
    const admin = runner.get("ADMIN");
    const bb = runner.get("BIG_BROTHER");
    await i.deferReply({ ephemeral: true });

    const member = i.options.getMember("member", true) as GuildMember;
    const result = await UserController.eject(member.id, admin, bb);

    return this.respond(i, result.code, result.success ? "SUCCESS" : "FAIL");
  }

  async admin_send(i: CommandInteraction) {
    const message = i.options.getString("message", true);
    const as = i.options.getMember("as", true) as GuildMember;

    let channel = i.options.getChannel("channel") as GuildBasedChannel | null;

    if (!channel) {
      channel = i.channel as GuildBasedChannel;
    }

    if (!as.user.bot) {
      await this.respond(i, "NOT_A_BOT", "FAIL");
      return;
    }

    const botId = Config.reverseClientId(as.id);
    if (!botId) {
      await this.respond(i, `BOT_NOT_FOUND \`${as.displayName}\``, "FAIL");
      return;
    }

    const bot = bots.find((bot) => bot.id === botId);
    if (!bot) {
      await this.respond(i, `BOT_NOT_FOUND: ${as.displayName}`, "FAIL");
      return;
    }

    Events.emit("SEND_MESSAGE_REQUEST", {
      bot,
      channel,
      message,
      i,
      done: (success) => {
        this.respond(
          i,
          success ? "MESSAGE_SENT" : "FAILED_TO_SEND",
          success ? "SUCCESS" : "FAIL"
        );
      },
    });
  }

  async admin_imprison(i: CommandInteraction, runner: Runner) {
    const admin = runner.get("ADMIN");
    const member = i.options.getMember("member", true) as GuildMember;

    const [_, res] = await Promise.all([
      i.deferReply({ ephemeral: true }),
      UserController.imprison(member.id, admin, runner.get("PRISONER")),
    ]);

    await this.respond(i, res.code, res.success ? "SUCCESS" : "FAIL");
  }

  async admin_release(i: CommandInteraction, runner: Runner) {
    const admin = runner.get("ADMIN");
    const member = i.options.getMember("member", true) as GuildMember;

    const [_, res] = await Promise.all([
      i.deferReply({ ephemeral: true }),
      UserController.release(member.id, admin),
    ]);

    await this.respond(i, res.code, res.success ? "SUCCESS" : "FAIL");
  }

  async admin_clear(i: CommandInteraction, runner: Runner) {
    const admin = runner.get("ADMIN");
    let channel = i.options.getChannel("channel");
    const number = i.options.getNumber("number");

    if (!channel) {
      channel = i.channel as GuildBasedChannel;
    }

    const c = await admin.getTextChannel(channel.id);

    try {
      await c.bulkDelete(number || 100);
      await this.respond(i, "CHANNEL_CLEARED", "SUCCESS");
    } catch (e) {
      await this.respond(i, "DISCORD_ERROR", "FAIL");
    }
  }

  async admin_issue(i: CommandInteraction) {
    const amount = i.options.getNumber("amount", true);

    try {
      await issueTokens(amount);
      // this.emit("TOKENS_ISSUED", { amount });
      await this.respond(i, "TOKENS_ISSUED", "SUCCESS");
    } catch (e) {
      await this.respond(i, "DIDNT_ISSUE_TOKENS", "FAIL");
    }
  }

  async admin_open(i: CommandInteraction, runner: Runner) {
    const districtId = i.options.getString("district", true) as DistrictId;

    try {
      await AppController.openDistrict(
        districtId,
        runner.get("BIG_BROTHER"),
        runner.get("ADMIN")
      );
      await this.respond(i, `${districtId}_OPENED`, "SUCCESS");
    } catch (e) {
      console.log(e);
      await this.respond(i, "DIDNT_SET_DISTRICT", "FAIL");
    }
  }

  async admin_close(i: CommandInteraction, runner: Runner) {
    const districtId = i.options.getString("district", true) as DistrictId;
    try {
      await AppController.closeDistrict(
        districtId,
        runner.get("BIG_BROTHER"),
        runner.get("ADMIN")
      );
      await this.respond(i, `${districtId}_CLOSED`, "SUCCESS");
    } catch (e) {
      await this.respond(i, "ENTRY_DISABLE_FAILED", "FAIL");
    }
  }

  async admin_setEntryMessage(i: CommandInteraction, runner: Runner) {
    await AppController.setEnterMessage(
      runner.get("BIG_BROTHER"),
      runner.get("ADMIN")
    );
    await this.respond(i, "MESSAGE_SENT", "SUCCESS");
  }
}
