import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToOne,
} from "typeorm";
import { QuestSymbol } from "../types";
import { EngagementLevel, EngagementLevelNumber } from "./EngagementLevel";

export type AchievementSymbol =
  | `${QuestSymbol}_QUEST_COMPLETED`
  | "FINISHED_TRAINER"
  | "HELP_REQUESTED"
  | "STATS_CHECKED"
  | `LEVEL_${EngagementLevelNumber}_REACHED`;

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
