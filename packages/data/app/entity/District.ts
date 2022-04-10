import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { CitizenRoleSymbol, DistrictSymbolEnum } from "../types";
import { ApartmentTenancy, Emoji } from "..";
import { Exclude } from "class-transformer";

@Entity()
export class District extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: DistrictSymbolEnum })
  @Index({ unique: true })
  symbol: `${DistrictSymbolEnum}`;

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

  static async open(symbol: `${DistrictSymbolEnum}`) {
    await this.update({ symbol }, { open: true });
  }

  static async close(symbol: `${DistrictSymbolEnum}`) {
    await this.update({ symbol }, { open: false });
  }

  get citizenRoleSymbol(): CitizenRoleSymbol {
    return `${this.symbol}_CITIZEN`;
  }
}
