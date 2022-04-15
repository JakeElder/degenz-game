import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Channel, User } from "..";
import { QuestLogMessage } from "./QuestLogMessage";

@Entity()
export class QuestLogChannel extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Channel, { cascade: true })
  @JoinColumn()
  channel: Channel;

  @OneToOne(() => User, (user) => user.questLogChannel)
  @JoinColumn()
  user: User;

  @OneToMany(
    () => QuestLogMessage,
    (questLogMessage) => questLogMessage.questLogChannel,
    { cascade: true }
  )
  questLogMessages: QuestLogMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
