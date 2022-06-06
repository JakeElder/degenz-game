import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { ManagedChannel, User } from "..";

// Open Toss (Any Opponent)
// 1. SIDE_SELECT
// 2. OPPONENT_DISCOVERY
// 3. COMPLETE

// Targeted NPC (NPC Opponent)
// 1. SIDE_SELECT
// 2. COMPLETE

// Targeted User (User Opponent)
// 1. SIDE_SELECT
// 2. AWAIT_OPPONENT
// 3. COMPLETE

type TossState =
  | "INITIALISED"
  | "SIDE_SELECT"
  | "OPPONENT_DISCOVERY"
  | "AWAIT_OPPONENT"
  | "COMPLETE";

type Outcome =
  | "CANCELLED"
  | "CHALLENGER_BALANCE_INSUFFICIENT"
  | "CHALLENGEE_DECLINED"
  | "TOSSED_SELF"
  | "CHALLENGER_WON"
  | "CHALLENGEE_WON";

@Entity()
export class Toss extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sideSelectToken: string;

  @Column({ nullable: true })
  challengeMessageId: string;

  @Column()
  type: "OPEN" | "DIRECT";

  @Column({ type: "varchar" })
  state: TossState;

  @Column({ type: "varchar", nullable: true })
  outcome: Outcome;

  @Column({ nullable: true })
  winner: "CHALLENGER" | "CHALLENGEE";

  @Column({ nullable: true })
  chosenSide: "HEADS" | "TAILS";

  @Column({ nullable: true })
  flippedSide: "HEADS" | "TAILS";

  @Column()
  amount: number;

  @Column()
  rake: number;

  @ManyToOne(() => ManagedChannel, { eager: true })
  channel: ManagedChannel;

  @ManyToOne(() => User, { eager: true, onDelete: "CASCADE", cascade: true })
  challenger: User;

  @ManyToOne(() => User, { eager: true, onDelete: "CASCADE", cascade: true })
  challengee: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
