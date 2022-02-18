import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { AppStateKey, DistrictId } from "types";

@Entity()
export class AppState extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: AppStateKey })
  @Index({ unique: true })
  key: AppStateKey;

  @Column({ type: "text", nullable: true })
  value: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async openDistrict(districtId?: DistrictId | null) {
    const row = await this.findOne({ key: AppStateKey.OPEN_DISTRICT });

    if (!row) {
      throw new Error(`${AppStateKey.OPEN_DISTRICT} not set`);
    }

    if (typeof districtId === "undefined") {
      return row.value as DistrictId | null;
    }

    row.value = districtId;
    await row.save();

    return row.value as DistrictId | null;
  }
}
