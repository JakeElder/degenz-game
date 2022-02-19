import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { DistrictId } from "types";
import { Tenancy } from "..";

@Entity()
export class District extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: DistrictId })
  @Index({ unique: true })
  symbol: DistrictId;

  @Column({ default: false })
  open: boolean;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  activeEmoji: string;

  @Column({ nullable: true })
  inactiveEmoji: string;

  @OneToMany(() => Tenancy, (tenancy) => tenancy.district)
  tenancies: Tenancy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async open(symbol: DistrictId) {
    this.update({ symbol }, { open: true });
  }

  static async close(symbol: DistrictId) {
    this.update({ symbol }, { open: false });
  }
}
