import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
} from "typeorm";

type ChannelTypeSymbol =
  | "APARTMENT"
  | "CELL"
  | "DORMITORY"
  | "MANAGED"
  | "ONBOARDING_THREAD"
  | "QUEST_LOG_THREAD";

@Entity()
export class DiscordChannel extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: string;

  @Column()
  type: ChannelTypeSymbol;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
