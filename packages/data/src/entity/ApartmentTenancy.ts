import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User, District } from "..";
import { Exclude } from "class-transformer";

export type ApartmentTenancyLevelSymbol = "AUTHORITY" | "GUEST";

@Entity()
export class ApartmentTenancy extends BaseEntity {
  type: "APARTMENT";

  constructor() {
    super();
    this.type = "APARTMENT";
  }

  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discordChannelId: string;

  @Column({ type: "varchar" })
  level: ApartmentTenancyLevelSymbol;

  @ManyToOne(() => District, (district) => district.tenancies, { eager: true })
  district: District;

  @ManyToOne(() => User, (user) => user.apartmentTenancies, {
    onDelete: "CASCADE",
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get dailyAllowance() {
    return this.district.allowance;
  }
}
