import { Exclude } from "class-transformer";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn, DeleteDateColumn,
    ManyToOne, Index
} from "typeorm";
import { Invite } from "./Invite";

@Entity()
export class InvitedUser extends BaseEntity {
    @Exclude()
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index({unique : true})
    discordId: string;

    @ManyToOne(() => Invite)
    inviteId: Invite;

    @Column({default: false})
    accepted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
