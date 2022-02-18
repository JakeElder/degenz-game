import { CommandInteraction } from "discord.js";
import React from "react";
import { CommandController } from "../CommandController";
import { getUser } from "../legacy/db";
import {
  FailedEscapeMessage,
  SuccessfulEscapeMessage,
} from "../legacy/templates";
import Runner from "../Runner";
import Utils from "../Utils";
import UserController from "./UserController";

const { r } = Utils;

export default class PrisonerCommandController extends CommandController {
  async escape(i: CommandInteraction, runner: Runner) {
    const user = await getUser(i.user.id);
    if (user === null) return;

    const code = i.options.getString("code", true);

    // Handle correct code
    if (code === "2345") {
      await i.reply({
        content: r(<SuccessfulEscapeMessage code={code} />),
        ephemeral: true,
      });
    } else {
      i.reply({
        content: r(<FailedEscapeMessage code={code} />),
        ephemeral: true,
      });
    }

    await Utils.delay(2000);

    const admin = runner.get("ADMIN");
    await UserController.release(user.discordId, admin);
  }
}
