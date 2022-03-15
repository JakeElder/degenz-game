import { Exclude } from "class-transformer";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn, DeleteDateColumn,
    ManyToOne
} from "typeorm";
import { Invite } from "./Invite";

@Entity()
export class InvitedUser extends BaseEntity {
    @Exclude()
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    inviterId: string;

    @ManyToOne(() => Invite)
    invite: Invite;

    @Column({ nullable: true })
    count: number;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
