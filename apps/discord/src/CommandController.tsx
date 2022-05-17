import React from "react";
import { camelCase, pascalCase } from "change-case";
import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageEmbedOptions,
  SelectMenuInteraction,
} from "discord.js";
import DiscordBot from "./DiscordBot";
import Events from "./Events";
import Config from "config";
import { AchievementSymbol, RoleSymbol } from "data/types";
import { User } from "data/db";
import Utils from "./Utils";
import { channelMention, roleMention, userMention } from "@discordjs/builders";

const requireRoleEmbed: (
  role: RoleSymbol,
  user: User,
  what: string
) => MessageEmbedOptions = (role, user, what) => {
  return {
    color: "RED",
    title: "Cannot Post to Channel",
    description: Utils.r(
      <>
        {userMention(user.id)} - You need to be at least{" "}
        {roleMention(Config.roleId(role))} to show {what}.
        <br />
        You can **level up** by being active in{" "}
        {channelMention(Config.channelId("GENERAL"))}.
      </>
    ),
  };
};

export abstract class CommandController {
  static requireAchievementToPost(
    post: boolean,
    achievement: AchievementSymbol,
    role: RoleSymbol,
    user: User,
    what: string,
    reply: InteractionReplyOptions
  ): InteractionReplyOptions {
    const [ephemeral, postDenied] = (() => {
      if (post) {
        return user.hasAchievement(achievement) ? [false, false] : [true, true];
      }
      return [true, false];
    })();

    return {
      ...reply,
      ephemeral,
      embeds: [
        ...(reply.embeds || []),
        ...(postDenied ? [requireRoleEmbed(role, user, what)] : []),
      ],
    };
  }

  async execute(i: CommandInteraction, bot: DiscordBot) {
    const command = bot.npc.commands.find((c) => c.data.name === i.commandName);

    if (!command) {
      this.error(i);
      Events.emit("COMMAND_NOT_FOUND", { i });
      return;
    }

    let option: string | undefined;
    try {
      option = camelCase(i.options.getSubcommand());
    } catch (e) {}

    let handler: any;

    if (i.commandName === "admin" && option !== "createInviteLink") {
      const member = await bot.guild.members.fetch(i.user.id);
      if (!member.roles.cache.has(Config.roleId("ADMIN"))) {
        await this.error(i);
        return;
      }
    }

    if (option && `${i.commandName}_${option}` in this) {
      handler = (this as any)[`${i.commandName}_${option}`];
    } else if (i.commandName in this) {
      handler = (this as any)[i.commandName];
    }

    if (handler) {
      try {
        await (handler as (i: CommandInteraction) => Promise<void>).call(
          this,
          i
        );
      } catch (e) {
        this.error(i);
        throw e;
      }
    } else {
      this.respond(i, "Command coming soon");
      Events.emit("COMMAND_NOT_IMPLEMENTED", { i });
      return;
    }
  }

  async error(i: CommandInteraction) {
    return this.respond(i, "\u26a0\ufe0f Error");
  }

  async respond(
    i: CommandInteraction,
    content: string,
    type: "SUCCESS" | "FAIL" | "NEUTRAL" = "NEUTRAL"
  ) {
    i.deferred || i.replied
      ? i.editReply({ content })
      : i.reply({ content, ephemeral: true });
    return;
  }

  async handleSelect(i: SelectMenuInteraction) {
    const handler = (this as any)[`handle${pascalCase(i.customId)}`];
    await (handler as (i: SelectMenuInteraction) => Promise<void>).call(
      this,
      i
    );
  }
}
