import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User, Dormitory, Channel } from "..";

@Entity()
export class DormitoryTenancy extends BaseEntity {
  type: "DORMITORY";

  constructor() {
    super();
    this.type = "DORMITORY";
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, { cascade: true, eager: true })
  onboardingChannel: Channel | null;

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
    return this.dormitory.channel.channel.id;
  }

  get dailyAllowance() {
    return 80;
  }
}
