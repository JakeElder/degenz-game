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

  @Column()
  name: string;

  @Column({ type: "float" })
  rarity: number;

  @Column()
  type: "DEGEN" | "THOUGHT_POLICE";

  @Column()
  rank: number;

  @Column()
  address: string;

  @Column({ type: "varchar" })
  state: State;

  @Column({ default: false })
  locked: boolean;

  @Column({ type: "json", default: [] })
  attributes: { trait_type: string; value: string | number }[];

  @Column()
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
