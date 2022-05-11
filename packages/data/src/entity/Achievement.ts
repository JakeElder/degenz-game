import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";
import { EngagementLevel, QuestSymbol } from "../types";

export type AchievementSymbol =
  | `${QuestSymbol}_QUEST_COMPLETED`
  | "FINISHED_TRAINER"
  | "HELP_REQUESTED"
  | "STATS_CHECKED"
  | `LEVEL_${EngagementLevel}_REACHED`;

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
