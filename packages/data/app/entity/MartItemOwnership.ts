import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from "typeorm";
import { MartItem, User } from "..";

@Entity()
export class MartItemOwnership extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.martItemOwnerships, {
    onDelete: "CASCADE",
  })
  user: User;

  @ManyToOne(() => MartItem, (martItem) => martItem.ownerships, { eager: true })
  item: MartItem;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
