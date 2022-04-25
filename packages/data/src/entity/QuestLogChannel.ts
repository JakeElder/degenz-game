import { Exclude } from "class-transformer";
import { Message } from "discord.js";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { Channel, User } from "..";
import { QuestLogState, QuestSymbol } from "../types";

@Entity()
export class QuestLogChannel extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Channel, { cascade: true, eager: true })
  @JoinColumn()
  channel: Channel;

  @OneToOne(() => User, (user) => user.questLogChannel)
  @JoinColumn()
  user: User;

  @Column({ type: "json", default: [] })
  state: QuestLogState;

  @Column({ type: "json", default: [] })
  messages: Message["id"][];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
