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
import { CitizenRoleSymbol, DistrictSymbol } from "../types";
import { ApartmentTenancy } from "..";
import { Exclude } from "class-transformer";

@Entity()
export class District extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: DistrictSymbol })
  @Index({ unique: true })
  symbol: DistrictSymbol;

  @Column({ default: false })
  open: boolean;

  @Column({ nullable: true })
  emoji: string;

  @Column({ nullable: true })
  activeEmoji: string;

  @Column({ nullable: true })
  inactiveEmoji: string;

  @Column({ nullable: true })
  allowance: number;

  @OneToMany(() => ApartmentTenancy, (tenancy) => tenancy.district)
  tenancies: ApartmentTenancy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async open(symbol: DistrictSymbol) {
    await this.update({ symbol }, { open: true });
  }

  static async close(symbol: DistrictSymbol) {
    await this.update({ symbol }, { open: false });
  }

  get citizenRoleSymbol(): CitizenRoleSymbol {
    return (
      {
        PROJECTS_D1: "D1_CITIZEN",
        PROJECTS_D2: "D2_CITIZEN",
        PROJECTS_D3: "D3_CITIZEN",
        PROJECTS_D4: "D4_CITIZEN",
        PROJECTS_D5: "D5_CITIZEN",
        PROJECTS_D6: "D6_CITIZEN",
      } as const
    )[this.symbol];
  }
}
