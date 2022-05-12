import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from "typeorm";
import { ManagedChannel, User } from "..";

@Entity()
@Unique("user_message", ["user", "messageId", "emojiId"])
export class Reaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  messageId: string;

  @Column()
  emojiId: string;

  @Column({ default: false })
  processed: boolean;

  @ManyToOne(() => ManagedChannel, { eager: true })
  channel: ManagedChannel;

  @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
