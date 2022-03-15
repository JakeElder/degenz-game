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
import { ApartmentTenancyLevelEnum } from "../types";

@Entity()
export class ApartmentTenancy extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discordChannelId: string;

  @Column({ type: "enum", enum: ApartmentTenancyLevelEnum })
  level: `${ApartmentTenancyLevelEnum}`;

  @ManyToOne(() => District, (district) => district.tenancies)
  district: District;

  @ManyToOne(() => User, (user) => user.apartmentTenancies, {
    onDelete: "CASCADE",
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
