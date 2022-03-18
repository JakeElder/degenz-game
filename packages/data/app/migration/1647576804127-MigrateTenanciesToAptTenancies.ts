import { MigrationInterface, QueryRunner } from "typeorm";
import { ApartmentTenancy } from "../entity/ApartmentTenancy";

export class MigrateTenanciesToAptTenancies1647576804127
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const res = await queryRunner.connection.query("SELECT * from tenancy");

    await ApartmentTenancy.insert(
      res.map((t: any) =>
        ApartmentTenancy.create({
          discordChannelId: t.discord_channel_id,
          district: { id: t.district_id },
          type: "APARTMENT",
          level: "AUTHORITY",
          user: { id: t.user_id },
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        })
      )
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
