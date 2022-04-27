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
} from "typeorm";
import { DiscordChannel, User } from "..";

@Entity()
export class OnboardingChannel extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => DiscordChannel, { cascade: true, eager: true })
  @JoinColumn()
  discordChannel: DiscordChannel;

  @OneToOne(() => User, (user) => user.questLogChannel)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
