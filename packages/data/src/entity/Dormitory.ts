import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";
import randomItem from "random-item";
import { AppState, DormitoryTenancy, Emoji, ManagedChannel, Role } from "..";

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

  @ManyToOne(() => ManagedChannel, { eager: true })
  channel: ManagedChannel;

  @ManyToOne(() => Emoji, { eager: true })
  emoji: Emoji;

  @ManyToOne(() => Emoji, { eager: true })
  inactiveEmoji: Emoji;

  @ManyToOne(() => Role, { eager: true })
  citizenRole: Role;

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
    const [state, dorms] = (await Promise.all([
      AppState.fetch(),
      this.createQueryBuilder("dormitory")
        .loadRelationCountAndMap(
          "dormitory.tenancyCount",
          "dormitory.tenancies"
        )
        .getMany(),
    ])) as [AppState, (Dormitory & { tenancyCount: number })[]];

    const available = dorms.filter(
      (d) => d.tenancyCount < state.dormitoryCapacity
    );

    if (available.length === 0) {
      return null;
    }

    const dorm = randomItem(available);
    return Dormitory.findOneOrFail({ where: { id: dorm.id } });
  }
}
