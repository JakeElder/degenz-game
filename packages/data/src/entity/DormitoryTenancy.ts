import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User, Dormitory } from "..";

@Entity()
export class DormitoryTenancy extends BaseEntity {
  type: "DORMITORY";

  constructor() {
    super();
    this.type = "DORMITORY";
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Dormitory, (dormitory) => dormitory.tenancies, {
    eager: true,
  })
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
    return this.dormitory.channel.discordChannel.id;
  }

  get dailyAllowance() {
    return 80;
  }
}
