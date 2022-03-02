import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { BotSymbol } from "../types";

@Entity()
export class NPC extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  symbol: BotSymbol;

  @Column({ type: "varchar", nullable: true })
  defaultEmojiId: string | null;

  @Column({ default: true, nullable: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
