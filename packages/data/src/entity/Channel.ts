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
  | "MANAGED"
  | "QUEST_LOG_THREAD"
  | "DORMITORY"
  | "CELL"
  | "APARTMENT"
  | "ONBOARDING_THREAD";

@Entity()
export class Channel extends BaseEntity {
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
