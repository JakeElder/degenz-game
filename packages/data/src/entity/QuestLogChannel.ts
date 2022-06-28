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
import { DiscordChannel, User } from "..";
import type { QuestLogState } from "../types";

@Entity()
export class QuestLogChannel extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => DiscordChannel, { cascade: true, eager: true })
  @JoinColumn()
  discordChannel: DiscordChannel;

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
