import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";
import { Emoji, MartItemOwnership } from "..";

export type MartItemSymbol =
  | "PIZZA"
  | "NOODLES"
  | "GRILLED_RAT"
  | "FRACTAL_NFT";

@Entity()
export class MartItem extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: MartItemSymbol;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column()
  strengthIncrease: number;

  @ManyToOne(() => Emoji, { eager: true })
  emoji: Emoji;

  @OneToMany(
    () => MartItemOwnership,
    (martItemOwnership) => martItemOwnership.item
  )
  ownerships: MartItemOwnership[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
