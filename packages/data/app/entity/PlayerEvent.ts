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
import { User } from "..";

@Entity()
export class PlayerEvent extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventType: string;

  @Column({ nullable: true })
  success: boolean;

  @Column({ nullable: true })
  isInstigator: boolean;

  @Column({ nullable: true })
  itemId: number;

  @Column({ nullable: true })
  cooldown: number;

  @Column({ nullable: true })
  adversaryId: string;

  @Column({ nullable: true })
  adversaryName: string;

  @ManyToOne(() => User, (user) => user.playerEvents, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn({default: () => "now() at time zone 'utc'"})
  createdAt: Date;

  @UpdateDateColumn({default: () => "now() at time zone 'utc'"})
  updatedAt: Date;
}
