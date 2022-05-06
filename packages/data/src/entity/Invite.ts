import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { InvitedUser } from "..";

@Entity()
export class Invite extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn({ type: "int4" })
  id: number;

  @Column()
  code: string;

  @Column()
  inviter: string;

  @Column({ type: "int4", default: 0 })
  count: number;

  @OneToMany(() => InvitedUser, ({ invite }) => invite, {
    eager: true,
    cascade: true,
  })
  invitedUsers: InvitedUser[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
