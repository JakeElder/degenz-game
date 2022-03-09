import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { MartItemOwnership } from "..";
import { MartItemSymbol, MartItemSymbolEnum } from "../types";

@Entity()
export class MartItem extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: MartItemSymbolEnum, unique: true })
  symbol: MartItemSymbol;

  @Column()
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column()
  strengthIncrease: number;

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
