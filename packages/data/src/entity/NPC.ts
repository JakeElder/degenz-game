import { ClientOptions, IntentsString } from "discord.js";
import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";
import { Emoji } from "..";
import { Command } from "../types";

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

  @Column()
  name: string;

  @ManyToOne(() => Emoji, { eager: true })
  emoji: Emoji;

  @Column({ default: true })
  enabled: boolean;

  @Column({ unique: true })
  clientId: string;

  commands: Command[];
  clientOptions: ClientOptions & { intents: IntentsString[] };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
