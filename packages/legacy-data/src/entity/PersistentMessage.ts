import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  BotSymbolEnum,
  ChannelSymbolEnum,
  PersistentMessageSymbolEnum,
} from "../types";

@Entity()
export class PersistentMessage extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: PersistentMessageSymbolEnum, unique: true })
  symbol: `${PersistentMessageSymbolEnum}`;

  @Column({ nullable: true })
  messageId: string;

  @Column({ type: "enum", enum: ChannelSymbolEnum })
  channelSymbol: `${ChannelSymbolEnum}`;

  @Column({ type: "enum", enum: BotSymbolEnum })
  maintainerSymbol: `${BotSymbolEnum}`;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
