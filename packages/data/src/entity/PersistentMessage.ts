import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";
import { NPC, ManagedChannel } from "..";

export type PersistentMessageSymbol =
  | "ENTRANCE"
  | "GBT_LEADERBOARD_1"
  | "GBT_LEADERBOARD_2"
  | "PLEDGE"
  | "GET_PFP"
  | "SHOW_QUESTS"
  | "REDEEM_MINT_PASS";

@Entity()
export class PersistentMessage extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: PersistentMessageSymbol;

  @Column({ nullable: true })
  messageId: string;

  @ManyToOne(() => ManagedChannel, { eager: true })
  channel: ManagedChannel;

  @ManyToOne(() => NPC, { eager: true })
  maintainer: NPC;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
