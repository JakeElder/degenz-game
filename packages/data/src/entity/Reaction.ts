import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  RelationId,
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

  @RelationId((reaction: Reaction) => reaction.channel)
  channelId: ManagedChannel["id"];

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @RelationId((reaction: Reaction) => reaction.user)
  userId: User["id"];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
