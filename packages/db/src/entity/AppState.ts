import { Message } from "discord.js";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class AppState extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  entryMessageId: Message["id"] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async setEntryMessageId(id: Message["id"]) {
    const row = await this.findOneOrFail();
    row.entryMessageId = id;
    await row.save();
  }

  static async getEntryMessageId() {
    const row = await this.findOneOrFail();
    return row.entryMessageId;
  }
}
