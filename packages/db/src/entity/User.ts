import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Role, TextChannel } from "discord.js";
import { Achievement as AchievementEnum } from "types";
import { Tenancy, MartItemOwnership, Pledge } from "..";
import { Achievement } from "./Achievement";
import { Imprisonment } from "./Imprisonment";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  discordId: string;

  @Column()
  displayName: string;

  @Column()
  gbt: number;

  @Column({ default: 100 })
  strength: number;

  @OneToMany(() => Tenancy, (tenancy) => tenancy.user, { cascade: true })
  tenancies: Tenancy[];

  @OneToMany(
    () => MartItemOwnership,
    (martItemOwnership) => martItemOwnership.user,
    { cascade: true }
  )
  martItemOwnerships: MartItemOwnership[];

  @OneToMany(() => Imprisonment, (imprisonment) => imprisonment.user, {
    cascade: true,
  })
  imprisonments: Imprisonment[];

  @OneToMany(() => Pledge, (pledge) => pledge.user, {
    cascade: true,
  })
  pledges: Pledge[];

  @ManyToMany(() => Achievement)
  @JoinTable()
  achievements: Achievement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  public async imprison({
    cellNumber,
    cellDiscordChannelId,
    entryRoleIds,
  }: {
    cellNumber: Imprisonment["cellNumber"];
    cellDiscordChannelId: TextChannel["id"];
    entryRoleIds: Role["id"][];
  }) {
    if (!this.imprisonments) {
      throw new Error("Imprisonments not loaded");
    }
    this.imprisonments.push(
      Imprisonment.create({ cellNumber, cellDiscordChannelId, entryRoleIds })
    );
    await this.save();
  }

  public get imprisoned() {
    if (!this.imprisonments) {
      throw new Error("Imprisonments not loaded");
    }
    return this.imprisonments.length === 1;
  }

  public get imprisonment() {
    if (!this.imprisoned) {
      throw new Error("Not imprisoned");
    }
    if (!this.imprisonments) {
      throw new Error("Imprisonments not loaded");
    }
    return this.imprisonments[0];
  }

  public get cellDiscordChannelId() {
    if (!this.imprisonments) {
      throw new Error("Imprisonments not loaded");
    }
    return this.imprisonments[0].cellDiscordChannelId;
  }

  public get primaryTenancy() {
    if (!this.tenancies) {
      throw new Error("Tenancies not loaded");
    }
    return this.tenancies[0];
  }

  public hasAchievement(achievement: AchievementEnum) {
    if (!this.achievements) {
      throw new Error("Achievements not loaded");
    }
    return !!this.achievements.find((a) => a.symbol === achievement);
  }
}
