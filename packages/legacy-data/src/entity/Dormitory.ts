import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Exclude } from "class-transformer";
import { CitizenRoleSymbol, DormitorySymbolEnum } from "../types";
import { AppState, DormitoryTenancy } from "..";
import randomItem from "random-item";

@Entity()
export class Dormitory extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  discordChannelId: string;

  @Column({ type: "enum", enum: DormitorySymbolEnum, unique: true })
  symbol: `${DormitorySymbolEnum}`;

  @Column({ nullable: true })
  activeEmoji: string;

  @Column({ nullable: true })
  inactiveEmoji: string;

  @OneToMany(
    () => DormitoryTenancy,
    (dormitoryTenancy) => dormitoryTenancy.dormitory
  )
  tenancies: DormitoryTenancy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async choose() {
    const [state, dorms] = await Promise.all([
      AppState.fetch(),
      this.createQueryBuilder("dormitory")
        .loadRelationCountAndMap(
          "dormitory.tenancyCount",
          "dormitory.tenancies"
        )
        .getMany(),
    ]);

    const available = dorms.filter(
      // @ts-ignore
      (d) => d.tenancyCount < state.dormitoryCapacity
    );

    if (available.length === 0) {
      return null;
    }

    return randomItem(available);
  }

  get citizenRoleSymbol(): CitizenRoleSymbol {
    return `${this.symbol}_CITIZEN`;
  }
}
