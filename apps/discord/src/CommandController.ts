import { camelCase, pascalCase } from "change-case";
import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import DiscordBot from "./DiscordBot";
import Events from "./Events";

export abstract class CommandController {
  constructor() {}

  async execute(i: CommandInteraction, bot: DiscordBot) {
    const command = bot.npc.commands.find((c) => c.data.name === i.commandName);

    if (!command) {
      this.error(i);
      Events.emit("COMMAND_NOT_FOUND", { i });
      return;
    }

    // if (command.restrict) {
    //   const [channelDescriptor, user] = await Promise.all([
    //     Channel.getDescriptor(i.channelId),
    //     User.findOneOrFail({
    //       where: { discordId: i.user.id },
    //       relations: ["achievements", "apartmentTenancies", "dormitoryTenancy"],
    //     }),
    //   ]);

    //   let interactee: User | null = null;
    //   if (command.symbol === "TRANSFER") {
    //     const recipient = i.options.getMember("recipient", true) as GuildMember;
    //     interactee = await User.findOneOrFail({
    //       where: { discordId: recipient.user.id },
    //       relations: ["achievements"],
    //     });
    //   }

    //   const r = await command.restrict(i, channelDescriptor, user, interactee);
    //   if (r) {
    //     i.replied ? i.editReply(r.response) : i.reply(r.response);
    //     return;
    //   }
    // }

    let option;
    try {
      option = camelCase(i.options.getSubcommand());
    } catch (e) {}

    let handler;

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
    return i.deferred || i.replied
      ? i.editReply({ content })
      : i.reply({ content, ephemeral: true });
  }

  async handleSelect(i: SelectMenuInteraction) {
    const handler = (this as any)[`handle${pascalCase(i.customId)}`];
    await (handler as (i: SelectMenuInteraction) => Promise<void>).call(
      this,
      i
    );
  }
}
