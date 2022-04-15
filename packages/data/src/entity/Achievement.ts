import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";

export type AchievementSymbol =
  | "HELP_REQUESTED"
  | "STATS_CHECKED"
  | "JOINED_THE_DEGENZ"
  | "SUPER_OBEDIENT"
  | "FINISHED_TRAINER"
  | "MART_STOCK_CHECKED"
  | "ALLEGIANCE_PLEDGED"
  | "TOSS_COMPLETED"
  | "MART_ITEM_BOUGHT";

@Entity()
export class Achievement extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: AchievementSymbol;

  @Column({ default: 100 })
  reward: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
