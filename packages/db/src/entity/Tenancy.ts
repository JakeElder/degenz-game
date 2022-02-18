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
import { DistrictId, TenancyType } from "types";
import { User } from "..";

@Entity()
export class Tenancy extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  discordChannelId: string;

  @Column({ type: "enum", enum: TenancyType })
  type: TenancyType;

  @Column({ type: "enum", enum: DistrictId })
  district: DistrictId;

  @ManyToOne(() => User, (user) => user.tenancies, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
