import {
  CommandInteraction,
  GuildBasedChannel,
  GuildMember,
  TextBasedChannel,
} from "discord.js";
import { AppState, User } from "data/db";
import { Format } from "lib";
import pluralize from "pluralize";
import { ILike } from "typeorm";
import prettyjson from "prettyjson";
import { issueTokens } from "../legacy/db";
import UserController from "../controllers/UserController";
import { CommandController } from "../CommandController";
import { DistrictSymbol } from "data/types";
import AppController from "../controllers/AppController";
import { Global } from "../Global";
import EnterTheProjectsController from "../controllers/EnterTheProjectsController";
import EnterTheSheltersController from "../controllers/EnterTheSheltersController";
import NextStepController from "../controllers/NextStepsController";
import { Channel } from "../Channel";
import OnboardController from "../controllers/OnboardController";
import Events from "../Events";

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
    const member = i.options.getUser("member");

    try {
      let user: User | undefined;
      if (member) {
        user = await User.findOne({
          where: { discordId: member.id },
        });
        if (!user || !user.inGame) {
          await this.respond(i, "USER_NOT_FOUND", "FAIL");
          return;
        }
        user.gbt += amount;
        await user.save();
      } else {
        await issueTokens(amount);
      }
      Events.emit("TOKENS_ISSUED", {
        issuerId: i.user.id,
        recipient: user || null,
        amount,
      });
    } catch (e) {
      await this.respond(i, "DIDNT_ISSUE_TOKENS", "FAIL");
      return;
    }

    await this.respond(i, "TOKENS_ISSUED", "SUCCESS");
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

  async admin_test(i: CommandInteraction) {}

  async admin_openShelters(i: CommandInteraction) {
    await this.setSheltersOpenState(i, true);
  }

  async admin_closeShelters(i: CommandInteraction) {
    await this.setSheltersOpenState(i, false);
  }

  async admin_sendNextSteps(i: CommandInteraction) {
    const member =
      i.options.getUser("member", false) || (i.member as GuildMember);
    const user = await User.findOneOrFail({ where: { discordId: member.id } });
    this.respond(i, `MESSAGE_SENT`, "SUCCESS");
    const ally = Global.bot("ALLY");
    const channel = await ally.guild.channels.fetch(i.channelId);
    await NextStepController.send(channel as TextBasedChannel, user);
  }

  async setSheltersOpenState(i: CommandInteraction, areOpen: boolean) {
    const state = await AppState.fetch();
    state.sheltersOpen = areOpen;
    await state.save();
    EnterTheSheltersController.update();
    await this.respond(
      i,
      `SHELTERS_${areOpen ? "OPENED" : "CLOSED"}`,
      "SUCCESS"
    );
  }

  async admin_purge(i: CommandInteraction) {
    const c = await Channel.getDescriptor(i.channelId);
    if (!c.isOnboardingThread || !c.channel.isThread()) {
      await this.respond(i, `NOT_A_THREAD`, "FAIL");
      return;
    }
    await OnboardController.purgeThread(c.channel);
    await this.respond(i, `PURGED`, "SUCCESS");
  }

  async admin_userSearch(i: CommandInteraction) {
    const query = i.options.getString("query", true);
    const users = await User.find({
      where: { displayName: ILike(`%${query}%`) },
      relations: ["apartmentTenancies", "dormitoryTenancy"],
    });

    await i.reply({
      content: `Found **${users.length} ${pluralize(
        "user",
        users.length
      )}** matching "**${query}**"`,
      ephemeral: true,
    });

    const interaction = i;

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const apartment = u.apartmentTenancies[0]
        ? prettyjson.render(
            { district: u.apartmentTenancies[0].district.symbol },
            { noColor: true }
          )
        : "--none--";

      const dormitory = u.dormitoryTenancy
        ? prettyjson.render(
            { dorm: u.dormitoryTenancy.dormitory.symbol },
            { noColor: true }
          )
        : "--none--";

      await interaction.followUp({
        embeds: [
          {
            author: {
              name: u.displayName,
            },
            fields: [
              { name: "GBT", value: Format.codeBlock(u.gbt) },
              { name: "Apartment", value: Format.codeBlock(apartment) },
              { name: "Dormitory", value: Format.codeBlock(dormitory) },
            ],
          },
        ],
        ephemeral: true,
      });
    }
  }
}
