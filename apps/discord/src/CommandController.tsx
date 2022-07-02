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
import { RoleSymbol } from "data/types";
import { User } from "data/db";
import { channelMention } from "@discordjs/builders";
import { RoleMention, UserMention } from "./legacy/templates";

export abstract class CommandController {
  static EngagementLevelInsufficient({
    user,
    role,
    what,
  }: {
    user: User;
    role: RoleSymbol;
    what: React.ReactNode;
  }) {
    const roleId = Config.roleId(role);
    return (
      <>
        <UserMention id={user.id} /> - You need to be at least{" "}
        <RoleMention id={roleId} /> to {what}.
        <br />
        You can **level up** by being active in{" "}
        {channelMention(Config.channelId("GENERAL"))}.
      </>
    );
  }

  static makeCannotPostEmbed(description: string): MessageEmbedOptions {
    return {
      color: "RED",
      title: "Cannot Post to Channel",
      description,
    };
  }

  static isEphemeral(i: CommandInteraction) {
    return i.options.getBoolean("hide") ? true : false;
  }

  static async reply(
    i: CommandInteraction,
    reply: InteractionReplyOptions,
    opts: {
      permit: boolean;
      message: string;
    } = {
      permit: false,
      message: "",
    }
  ) {
    // const [ephemeral, postDenied] = (() => {
    //   if (i.options.getBoolean("post")) {
    //     return opts.permit ? [false, false] : [true, true];
    //   }
    //   return [true, false];
    // })();

    const [ephemeral, postDenied] = [
      i.options.getBoolean("hide") ? true : false,
      false,
    ];

    if (i.deferred) {
      await i.editReply({
        ...reply,
        embeds: [
          ...(reply.embeds || []),
          ...(postDenied ? [this.makeCannotPostEmbed(opts.message)] : []),
        ],
      });
      return;
    }

    await i.reply({
      ...reply,
      ephemeral,
      embeds: [
        ...(reply.embeds || []),
        ...(postDenied ? [this.makeCannotPostEmbed(opts.message)] : []),
      ],
    });
  }

  async execute(i: CommandInteraction, bot: DiscordBot) {
    const command = bot.npc.commands.find((c) => c.data.name === i.commandName);

    if (!command) {
      this.error(i);
      Events.emit("COMMAND_NOT_FOUND", { i });
      return;
    }

    const cmd = camelCase(i.commandName);
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

    if (option && `${cmd}_${option}` in this) {
      handler = (this as any)[`${cmd}_${option}`];
    } else if (cmd in this) {
      handler = (this as any)[cmd];
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
    const [fn, ...params] = i.customId.split(":");
    const handler = (this as any)[`handle${pascalCase(fn)}`];
    await (handler as (i: SelectMenuInteraction) => Promise<void>).call(
      this,
      i,
      params
    );
  }
}
