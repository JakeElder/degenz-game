import { Bot, BotId } from "types";
import ADMIN from "./admin";

const bots: Partial<Record<BotId, Bot>> = { ADMIN };

export default bots;
