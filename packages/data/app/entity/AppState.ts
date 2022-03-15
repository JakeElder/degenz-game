import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";

@Entity()
export class AppState extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  dormitoryCapacity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async fetch() {
    return this.findOneOrFail();
  }

  static async increaseDormitoryCapacity(amount: number) {
    const state = await this.fetch();
    state.dormitoryCapacity += amount;
    await state.save();
  }
}
