import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from "typeorm";
import { User } from "..";

@Entity()
export class Pledge extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  yield: number;

  @ManyToOne(() => User, (user) => user.pledges, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
