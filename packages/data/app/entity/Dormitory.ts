import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import { CitizenRoleSymbol, DormitorySymbolEnum } from "../types";
import { AppState, DormitoryTenancy } from "..";
import randomItem from "random-item";
import { Emoji } from "./Emoji";

@Entity()
export class Dormitory extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  discordChannelId: string;

  @Column({ type: "enum", enum: DormitorySymbolEnum, unique: true })
  symbol: `${DormitorySymbolEnum}`;

  @OneToOne(() => Emoji, { eager: true })
  @JoinColumn()
  emoji: Emoji;

  @OneToOne(() => Emoji, { eager: true })
  @JoinColumn()
  inactiveEmoji: Emoji;

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
      this.createQueryBuilder<Dormitory & { tenancyCount: number }>("dormitory")
        .loadRelationCountAndMap(
          "dormitory.tenancyCount",
          "dormitory.tenancies"
        )
        .getMany(),
    ]);

    const available = dorms.filter(
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
