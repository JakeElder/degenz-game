import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { Role } from "discord.js";
import {
  ApartmentTenancy,
  MartItemOwnership,
  Pledge,
  QuestLogChannel,
  Channel,
} from "..";
import { Achievement, AchievementSymbol } from "./Achievement";
import { Imprisonment } from "./Imprisonment";
import { PlayerEvent } from "./PlayerEvent";
import { DormitoryTenancy } from "./DormitoryTenancy";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  gbt: number;

  @Column({ nullable: true })
  strength: number;

  @Column({ type: "int4", array: true, default: [] })
  inventory: number[];

  @Column({ type: "int4", default: 0 })
  focus: number;

  @Column({ type: "int4", default: 0 })
  charisma: number;

  @Column({ type: "int4", default: 0 })
  luck: number;

  @Column({ default: false })
  inGame: boolean;

  @OneToMany(() => ApartmentTenancy, (tenancy) => tenancy.user, {
    eager: true,
    cascade: true,
  })
  apartmentTenancies: ApartmentTenancy[];

  @OneToOne(() => DormitoryTenancy, (tenancy) => tenancy.user, {
    eager: true,
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  dormitoryTenancy: DormitoryTenancy;

  @OneToOne(() => QuestLogChannel, (questLogChannel) => questLogChannel.user, {
    cascade: true,
  })
  questLogChannel: QuestLogChannel;

  @OneToMany(() => PlayerEvent, (playerEvent) => playerEvent.user, {
    cascade: true,
  })
  playerEvents: PlayerEvent[];

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

  @Column({ type: "timestamp", nullable: true })
  welcomeMentionMadeAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  public async imprison({
    cellNumber,
    channel,
    entryRoleIds,
    releaseCode,
    reason,
  }: {
    cellNumber: Imprisonment["cellNumber"];
    channel: Channel;
    entryRoleIds: Role["id"][];
    releaseCode: Imprisonment["releaseCode"];
    reason: Imprisonment["reason"];
  }) {
    if (!this.imprisonments) {
      throw new Error("Imprisonments not loaded");
    }
    this.imprisonments.push(
      Imprisonment.create({
        entryRoleIds,
        reason,
        cellNumber,
        channel,
        releaseCode,
      })
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
    return this.imprisonments[0].channel.id;
  }

  public get notificationChannelId() {
    if (this.apartmentTenancies.length > 0) {
      return this.apartmentTenancies[0].discordChannelId;
    }

    if (this.dormitoryTenancy.onboardingChannel?.id) {
      return this.dormitoryTenancy.onboardingChannel.id;
    }

    return this.dormitoryTenancy.dormitory.channel.channel.id;
  }

  public get primaryTenancy() {
    if (this.apartmentTenancies.length > 0) {
      return this.apartmentTenancies[0];
    }

    return this.dormitoryTenancy;
  }

  public hasAchievement(achievement: AchievementSymbol) {
    if (!this.achievements) {
      throw new Error("Achievements not loaded");
    }
    return !!this.achievements.find((a) => a.id === achievement);
  }

  get mention() {
    return `<@${this.id}>`;
  }
}
