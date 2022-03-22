import { Routes } from "discord-api-types/v9";
import Config from "config";
import { connect, disconnect, Role, User } from "data/db";
import { Command } from "../../lib";

export default class AddCitizenRoles extends Command {
  static description = "Add's citizen role to existing users.";

  async run(): Promise<void> {
    await connect();

    const users = await User.find({ where: { inGame: true } });

    for (let i = 0; i < users.length; i++) {
      const tenancy = users[i].primaryTenancy;
      const symbol =
        tenancy.type === "APARTMENT"
          ? tenancy.district.citizenRoleSymbol
          : tenancy.dormitory.citizenRoleSymbol;

      process.stdout.write(
        `${i + 1} of ${users.length} : ${users[i].displayName} - ${symbol}`
      );

      const role = await Role.findOneOrFail({ where: { symbol: symbol } });

      await this.put(
        Routes.guildMemberRole(
          Config.general("GUILD_ID"),
          users[i].discordId,
          role.discordId
        ),
        {},
        Config.botToken("ADMIN")
      );
      process.stdout.cursorTo(0);
      console.log(
        `${i + 1} of ${users.length} : ${
          users[i].displayName
        } - ${symbol} : DONE`
      );
    }

    await disconnect();
  }
}
