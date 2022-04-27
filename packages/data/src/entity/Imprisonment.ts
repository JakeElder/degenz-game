import { Exclude } from "class-transformer";
import { TextChannel } from "discord.js";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User, DiscordChannel } from "..";

@Entity()
export class Imprisonment extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "json",
    array: false,
    default: () => "'[]'",
    nullable: false,
  })
  entryRoleIds: TextChannel["id"][];

  @Column()
  reason: string;

  @Column()
  cellNumber: number;

  @OneToOne(() => DiscordChannel, { eager: true })
  @JoinColumn()
  discordChannel: DiscordChannel;

  @Column()
  releaseCode: string;

  @ManyToOne(() => User, (user) => user.imprisonments, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
