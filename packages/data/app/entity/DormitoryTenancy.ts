import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "..";
import { Exclude } from "class-transformer";
import { Dormitory } from "..";

@Entity()
export class DormitoryTenancy extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Dormitory, (dormitory) => dormitory.tenancies)
  dormitory: Dormitory;

  @ManyToOne(() => User, (user) => user.apartmentTenancies, {
    onDelete: "CASCADE",
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
