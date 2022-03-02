import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { TenancyType } from "../types";
import { User, District } from "..";
import { Exclude } from "class-transformer";

@Entity()
export class Tenancy extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  discordChannelId: string;

  @Column({ type: "enum", enum: TenancyType })
  type: TenancyType;

  @ManyToOne(() => District, (district) => district.tenancies)
  district: District;

  @ManyToOne(() => User, (user) => user.tenancies, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
