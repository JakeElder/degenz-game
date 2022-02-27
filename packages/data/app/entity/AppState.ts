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

  @Column({ type: "text", nullable: true })
  verifyMessageId: Message["id"] | null;

  @Column({ type: "text", nullable: true })
  leaderboardMessageId: Message["id"] | null;

  @Column({ type: "text", nullable: true })
  pledgeMessageId: Message["id"] | null;

  @Column({ type: "text", nullable: true })
  welcomeInfoMessageId: Message["id"] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async setLeaderboardMessageId(id: Message["id"]) {
    const row = await this.findOneOrFail();
    row.leaderboardMessageId = id;
    await row.save();
  }

  static async getLeaderboardMessageId() {
    const row = await this.findOneOrFail();
    return row.leaderboardMessageId;
  }

  static async setPledgeMessageId(id: Message["id"]) {
    const row = await this.findOneOrFail();
    row.pledgeMessageId = id;
    await row.save();
  }

  static async getPledgeMessageId() {
    const row = await this.findOneOrFail();
    return row.pledgeMessageId;
  }

  static async setVerifyMessageId(id: Message["id"]) {
    const row = await this.findOneOrFail();
    row.verifyMessageId = id;
    await row.save();
  }

  static async getVerifyMessageId() {
    const row = await this.findOneOrFail();
    return row.verifyMessageId;
  }

  static async setEntryMessageId(id: Message["id"]) {
    const row = await this.findOneOrFail();
    row.entryMessageId = id;
    await row.save();
  }

  static async getEntryMessageId() {
    const row = await this.findOneOrFail();
    return row.entryMessageId;
  }

  static async setWelcomeInfoMessageId(id: Message["id"]) {
    const row = await this.findOneOrFail();
    row.welcomeInfoMessageId = id;
    await row.save();
  }

  static async getWelcomeInfoMessageId() {
    const row = await this.findOneOrFail();
    return row.welcomeInfoMessageId;
  }
}
