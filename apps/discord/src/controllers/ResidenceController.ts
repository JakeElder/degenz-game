import { User } from "data/db";
import { NPCSymbol } from "data/types";
import { TextBasedChannel } from "discord.js";
import { Global } from "../Global";

class ResidenceController {
  static async get(user: User, botSymbol: NPCSymbol = "ADMIN") {
    const tenancy = user.primaryTenancy;
    const bot = Global.bot(botSymbol);

    return bot.getTextChannel(tenancy.discordChannelId);
  }

  static async add(residence: TextBasedChannel, id: string) {
    if (residence.isThread()) {
      await residence.members.add(id);
      return;
    }

    if (residence.type === "GUILD_TEXT") {
      await residence.permissionOverwrites.create(id, {
        VIEW_CHANNEL: true,
      });
      return;
    }
  }

  static async remove(residence: TextBasedChannel, id: string) {
    if (residence.isThread()) {
      await residence.members.remove(id);
      return;
    }

    if (residence.type === "GUILD_TEXT") {
      await residence.permissionOverwrites.delete(id);
      return;
    }
  }
}

export default ResidenceController;
