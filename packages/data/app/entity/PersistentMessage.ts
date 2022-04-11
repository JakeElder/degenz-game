import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ChannelSymbol, PersistentMessageSymbolEnum } from "../types";
import { NPCSymbol } from "../entity/NPC";

@Entity()
export class PersistentMessage extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: PersistentMessageSymbolEnum, unique: true })
  symbol: `${PersistentMessageSymbolEnum}`;

  @Column({ nullable: true })
  messageId: string;

  @Column()
  channelSymbol: ChannelSymbol;

  @Column()
  maintainerSymbol: NPCSymbol;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
