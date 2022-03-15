import { CommandInteraction, GuildBasedChannel, GuildMember } from "discord.js";
import { issueTokens } from "../legacy/db";
import UserController from "../controllers/UserController";
import { CommandController } from "../CommandController";
import { DistrictSymbol } from "data/types";
import AppController from "../controllers/AppController";
import { Global } from "../Global";
import EnterTheProjectsController from "../controllers/EnterTheProjectsController";
import { AppState, Dormitory } from "data/db";
import { Format } from "lib";
import EnterTheSheltersController from "../controllers/EnterTheSheltersController";

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

  async admin_initiate(i: CommandInteraction) {
    await i.deferReply({ ephemeral: true });

    const onboard = i.options.getBoolean("onboard");
    const districtSymbol = i.options.getString("district") as DistrictSymbol;
    const member = i.options.getMember("member", true) as GuildMember;

    const result = await UserController.initApartment(
      member.id,
      onboard === null || onboard ? true : false,
      districtSymbol
    );

    return this.respond(i, result.code, result.success ? "SUCCESS" : "FAIL");
  }

  async admin_eject(i: CommandInteraction) {
    await i.deferReply({ ephemeral: true });

    const member = i.options.getMember("member", true) as GuildMember;
    const result = await UserController.eject(member.id);

    return this.respond(i, result.code, result.success ? "SUCCESS" : "FAIL");
  }

  async admin_send(i: CommandInteraction) {
    const message = i.options.getString("message", true);
    const as = i.options.getMember("as", true) as GuildMember;

    let channel = i.options.getChannel("channel") as GuildBasedChannel | null;

    if (!channel) {
      channel = i.channel as GuildBasedChannel;
    }

    const res = await AppController.sendMessageFromBot({
      as,
      channel,
      message,
    });

    return this.respond(
      i,
      res.success ? "MESSAGE_SENT" : res.code,
      res.success ? "SUCCESS" : "FAIL"
    );
  }

  async admin_imprison(i: CommandInteraction) {
    const member = i.options.getMember("member", true) as GuildMember;

    const [_, res] = await Promise.all([
      i.deferReply({ ephemeral: true }),
      UserController.imprison(member.id),
    ]);

    await this.respond(i, res.code, res.success ? "SUCCESS" : "FAIL");
  }

  async admin_release(i: CommandInteraction) {
    const member = i.options.getMember("member", true) as GuildMember;

    const [_, res] = await Promise.all([
      i.deferReply({ ephemeral: true }),
      UserController.release(member.id),
    ]);

    await this.respond(i, res.code, res.success ? "SUCCESS" : "FAIL");
  }

  async admin_clear(i: CommandInteraction) {
    const admin = Global.bot("ADMIN");
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

  async admin_open(i: CommandInteraction) {
    const districtSymbol = i.options.getString(
      "district",
      true
    ) as DistrictSymbol;

    try {
      await AppController.openDistrict(districtSymbol);
      await this.respond(i, `${districtSymbol}_OPENED`, "SUCCESS");
    } catch (e) {
      console.log(e);
      await this.respond(i, "DIDNT_SET_DISTRICT", "FAIL");
    }
  }

  async admin_close(i: CommandInteraction) {
    const districtSymbol = i.options.getString(
      "district",
      true
    ) as DistrictSymbol;
    try {
      await AppController.closeDistrict(districtSymbol);
      await this.respond(i, `${districtSymbol}_CLOSED`, "SUCCESS");
    } catch (e) {
      await this.respond(i, "ENTRY_DISABLE_FAILED", "FAIL");
    }
  }

  async admin_setEntryMessage(i: CommandInteraction) {
    await EnterTheProjectsController.update();
    await this.respond(i, "MESSAGE_SENT", "SUCCESS");
  }

  async admin_increaseDormCapacity(i: CommandInteraction) {
    const amount = i.options.getNumber("amount", true);
    if (amount > 50) {
      await this.respond(i, "50_MAXIMUM_EXCEEDED", "FAIL");
    }
    await AppState.increaseDormitoryCapacity(amount);
    EnterTheSheltersController.update();
    await this.respond(i, `DORM_CAPACITY_INCREASED: +${amount}`, "SUCCESS");
  }
}
