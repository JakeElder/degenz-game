import { CommandInteraction, GuildBasedChannel, GuildMember } from "discord.js";
import Config from "app-config";
import { bots } from "manifest";
import { Tenancy } from "../legacy/types";
import Events from "../Events";
import { getTenanciesInDistrict, issueTokens, setDistrict } from "../legacy/db";
import AdminBot from "../bots/AdminBot";
import UserController from "./UserController";
import { CommandController } from "../CommandController";
import WaitingRoomController from "./WaitingRoomController";

export default class AdminCommandController extends CommandController {
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

  async admin_initiate(i: CommandInteraction, bot: AdminBot) {
    await i.deferReply({ ephemeral: true });

    const onboard = i.options.getBoolean("onboard");
    const district = i.options.getNumber("district") as Tenancy["district"];
    const member = i.options.getMember("member", true) as GuildMember;

    const result = await UserController.init(
      member.id,
      onboard === null || onboard ? true : false,
      district,
      bot
    );

    return this.respond(i, result.code, result.success ? "SUCCESS" : "FAIL");
  }

  async admin_eject(i: CommandInteraction, bot: AdminBot) {
    await i.deferReply({ ephemeral: true });

    const member = i.options.getMember("member", true) as GuildMember;
    const result = await UserController.eject(member.id, bot);

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

  async admin_imprison(i: CommandInteraction, bot: AdminBot) {
    const member = i.options.getMember("member", true) as GuildMember;

    const [_, res] = await Promise.all([
      i.deferReply({ ephemeral: true }),
      UserController.imprison(member.id, bot),
    ]);

    await this.respond(i, res.code, res.success ? "SUCCESS" : "FAIL");
  }

  async admin_release(i: CommandInteraction, bot: AdminBot) {
    const member = i.options.getMember("member", true) as GuildMember;

    const [_, res] = await Promise.all([
      i.deferReply({ ephemeral: true }),
      UserController.release(member.id, bot),
    ]);

    await this.respond(i, res.code, res.success ? "SUCCESS" : "FAIL");
  }

  async admin_clear(i: CommandInteraction, bot: AdminBot) {
    let channel = i.options.getChannel("channel");
    const number = i.options.getNumber("number");

    if (!channel) {
      channel = i.channel as GuildBasedChannel;
    }

    const c = await bot.getTextChannel(channel.id);

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

  async admin_open(i: CommandInteraction, bot: AdminBot) {
    const district = i.options.getNumber(
      "district",
      true
    ) as Tenancy["district"];

    try {
      await setDistrict(district);
      const tenancies = await getTenanciesInDistrict(district);
      if (tenancies < Config.general("DISTRICT_CAPACITY")) {
        await WaitingRoomController.setStatus(true, bot);
      }
      await this.respond(i, `DISTRICT_${district}_OPENED`, "SUCCESS");
    } catch (e) {
      await this.respond(i, "DIDNT_SET_DISTRICT", "FAIL");
    }
  }

  async admin_close(i: CommandInteraction, bot: AdminBot) {
    try {
      await Promise.all([
        setDistrict(null),
        WaitingRoomController.setStatus(false, bot),
      ]);

      await this.respond(i, "ENTRY_DISABLED", "SUCCESS");
    } catch (e) {
      await this.respond(i, "ENTRY_DISABLE_FAILED", "FAIL");
    }
  }
}
