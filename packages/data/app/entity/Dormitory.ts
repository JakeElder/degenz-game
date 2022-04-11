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
import { AppState, DormitoryTenancy } from "..";
import randomItem from "random-item";
import { Emoji } from "./Emoji";

export type DormitorySymbol =
  | "THE_LEFT"
  | "THE_RIGHT"
  | "THE_GRID"
  | "BULLSEYE"
  | "VULTURE";

@Entity()
export class Dormitory extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: DormitorySymbol;

  @Column({ nullable: true })
  discordChannelId: string;

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
    return `${this.id}_CITIZEN`;
  }
}
