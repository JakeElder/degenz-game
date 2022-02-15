import { CommandInteraction, GuildBasedChannel } from "discord.js";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { Bot } from "types";
import { User } from "./legacy/types";

export type Events = {
  BOT_READY: (e: { bot: Bot }) => void;
  COMMAND_NOT_FOUND: (e: { i: CommandInteraction }) => void;
  COMMAND_NOT_IMPLEMENTED: (e: { i: CommandInteraction }) => void;
  SEND_MESSAGE_REQUEST: (e: {
    bot: Bot;
    channel: GuildBasedChannel;
    message: string;
    i: CommandInteraction;
    done: (success: boolean) => void;
  }) => void;
  APARTMENT_ALLOCATED: (e: { user: User; onboard: boolean }) => void;
};

export default new EventEmitter() as TypedEmitter<Events>;
