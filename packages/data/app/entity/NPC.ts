import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Emoji } from "..";

export type NPCSymbol =
  | "ADMIN"
  | "ALLY"
  | "ARMORY_CLERK"
  | "BANKER"
  | "BIG_BROTHER"
  | "DEVILS_ADVOCATE"
  | "MART_CLERK"
  | "PRISONER"
  | "SCOUT"
  | "SENSEI"
  | "TOSSER"
  | "WARDEN"
  | "RESISTANCE_LEADER";

@Entity()
export class NPC extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: NPCSymbol;

  @OneToOne(() => Emoji, { eager: true })
  @JoinColumn()
  emoji: Emoji;

  @Column({ default: true, nullable: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
