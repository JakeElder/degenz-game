import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { MartItemOwnership } from "..";

@Entity()
export class MartItem extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  symbol: string;

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
