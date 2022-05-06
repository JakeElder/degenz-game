import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Invite } from "..";

@Entity()
export class InvitedUser extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn({ type: "int4" })
  id: number;

  @Column()
  discordId: string;

  @Column({ default: false })
  accepted: boolean;

  @Column({ type: "int4", default: 0 })
  count: number;

  @ManyToOne(() => Invite)
  invite: Invite;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
