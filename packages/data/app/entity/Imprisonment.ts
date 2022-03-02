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
} from "typeorm";
import { User } from "..";

@Entity()
export class Imprisonment extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "jsonb",
    array: false,
    default: () => "'[]'",
    nullable: false,
  })
  entryRoleIds: TextChannel["id"][];

  @Column({ nullable: true })
  reason: string;

  @Column()
  cellNumber: number;

  @Column({ unique: true })
  cellDiscordChannelId: string;

  @ManyToOne(() => User, (user) => user.imprisonments, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
