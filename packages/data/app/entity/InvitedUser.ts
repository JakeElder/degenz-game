import { Exclude } from "class-transformer";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn, UpdateDateColumn,
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
    invite: Invite;

    @Column({default: false})
    accepted: boolean;

    @CreateDateColumn({default: () => "(now() at time zone 'utc')"})
    createdAt: Date;

    @UpdateDateColumn({default: () => "(now() at time zone 'utc')"})
    updatedAt: Date;
}
