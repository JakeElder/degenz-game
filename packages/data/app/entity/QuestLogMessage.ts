import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from "typeorm";
import { QuestLogChannel } from "..";
import { QuestSymbolEnum } from "../types";

@Entity()
export class QuestLogMessage extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: QuestSymbolEnum })
  quest: `${QuestSymbolEnum}`;

  @Column()
  discordId: string;

  @Column({ default: false })
  expanded: boolean;

  @ManyToOne(
    () => QuestLogChannel,
    (questLogChannel) => questLogChannel.questLogMessages,
    { onDelete: "CASCADE" }
  )
  questLogChannel: QuestLogChannel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
