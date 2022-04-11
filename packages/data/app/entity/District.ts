import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { CitizenRoleSymbol } from "../types";
import { ApartmentTenancy, Emoji } from "..";

export type DistrictSymbol = "D1" | "D2" | "D3" | "D4" | "D5" | "D6";

@Entity()
export class District extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: DistrictSymbol;

  @Column({ default: false })
  open: boolean;

  @OneToOne(() => Emoji, { eager: true })
  @JoinColumn()
  emoji: Emoji;

  @Column({ nullable: true })
  allowance: number;

  @OneToMany(() => ApartmentTenancy, (tenancy) => tenancy.district)
  tenancies: ApartmentTenancy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async open(id: DistrictSymbol) {
    await this.update({ id }, { open: true });
  }

  static async close(id: DistrictSymbol) {
    await this.update({ id }, { open: false });
  }

  get citizenRoleSymbol(): CitizenRoleSymbol {
    return `${this.id}_CITIZEN`;
  }
}
