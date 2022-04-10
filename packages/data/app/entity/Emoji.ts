import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { EmojiSymbol, EmojiSymbolEnum } from "../types";

@Entity()
export class Emoji extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: EmojiSymbolEnum, unique: true })
  symbol: EmojiSymbol;

  @Column()
  identifier: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toString() {
    return `<:${this.identifier}>`;
  }
}
