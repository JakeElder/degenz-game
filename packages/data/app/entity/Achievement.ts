import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Achievement as AchievementEnum } from "../types";

@Entity()
export class Achievement extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: AchievementEnum, unique: true })
  symbol: AchievementEnum;

  @Column({ default: 100 })
  reward: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
