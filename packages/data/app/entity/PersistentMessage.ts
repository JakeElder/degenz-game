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
  PersistentMessageSymbol,
} from "../types";

@Entity()
export class PersistentMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: PersistentMessageSymbol, unique: true })
  symbol: PersistentMessageSymbol;

  @Column()
  messageId: string;

  @Column({ type: "enum", enum: ChannelSymbolEnum, unique: true })
  channelSymbol: ChannelSymbolEnum;

  @Column({ type: "enum", enum: BotSymbolEnum, unique: true })
  maintainerSymbol: BotSymbolEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
