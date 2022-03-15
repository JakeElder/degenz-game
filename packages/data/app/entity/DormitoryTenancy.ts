import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
  OneToOne,
} from "typeorm";
import { User } from "..";
import { Exclude } from "class-transformer";
import { Dormitory } from "..";

@Entity()
export class DormitoryTenancy extends BaseEntity {
  type: "DORMITORY";

  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  onboardingThreadId: string;

  @ManyToOne(() => Dormitory, (dormitory) => dormitory.tenancies)
  dormitory: Dormitory;

  @OneToOne(() => User, (user) => user.dormitoryTenancy, {
    onDelete: "CASCADE",
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get discordChannelId() {
    return this.dormitory.discordChannelId;
  }
}
