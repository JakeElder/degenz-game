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
import { User, Channel } from "..";

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

  @OneToOne(() => Channel, { eager: true })
  @JoinColumn()
  channel: Channel;

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
