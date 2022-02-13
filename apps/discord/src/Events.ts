import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { Bot } from "types";

export type Events = {
  BOT_READY: (data: { bot: Bot }) => void;
};

export default new EventEmitter() as TypedEmitter<Events>;
