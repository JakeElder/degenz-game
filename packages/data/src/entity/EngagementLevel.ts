import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Emoji } from "..";

export const LEVELS = [
  1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30, 35, 40, 50,
] as const;

export type EngagementLevelNumber = typeof LEVELS[number];

@Entity()
export class EngagementLevel extends BaseEntity {
  @PrimaryColumn({ type: "int", unique: true })
  id: EngagementLevelNumber;

  @OneToOne(() => Emoji, { eager: true })
  @JoinColumn()
  emoji: Emoji;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get number() {
    return this.id;
  }
}
