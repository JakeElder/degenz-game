import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  Column,
} from "typeorm";

export type State = "OWNED_EXTERNALLY" | "OWNED_INTERNALLY" | "AWAITING_TX_OUT";

@Entity()
export class GenOneToken extends BaseEntity {
  @PrimaryColumn({ unique: true })
  id: number;

  @Column({ type: "varchar" })
  state: State;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
