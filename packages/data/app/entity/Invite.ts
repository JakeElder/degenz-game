import { Exclude } from "class-transformer";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from "typeorm";

@Entity()
export class Invite extends BaseEntity {
    @Exclude()
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    inviter: string;

    @Column({default: 0})
    count: number;

    @CreateDateColumn({default: () => "(now() at time zone 'utc')"})
    createdAt: Date;

    @UpdateDateColumn({default: () => "(now() at time zone 'utc')"})
    updatedAt: Date;
}
