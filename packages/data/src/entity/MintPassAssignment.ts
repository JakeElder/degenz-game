import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "..";
import { GenOneToken } from "./GenOneToken";

@Entity()
export class MintPassAssignment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.mintPassAssignments, { eager: true })
  recipient: User;

  @Column()
  txWallet: string;

  @OneToOne(() => GenOneToken, { eager: true, cascade: true })
  @JoinColumn()
  token: GenOneToken;

  @Column({ nullable: true })
  logMessageId: string;

  @Column({ default: false })
  fulfilled: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
