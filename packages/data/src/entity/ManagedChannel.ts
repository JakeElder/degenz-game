import { PermissionString } from "discord.js";
import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { DistrictSymbol, RoleSymbol } from "../types";
import { DormitorySymbol } from "./Dormitory";
import { DiscordChannel } from "..";
import { Type } from "class-transformer";

export type NestedManagedChannelSymbol =
  | "ENTRANCE"
  | "QUESTS"
  | "ANNOUNCEMENTS"
  | "LEADERBOARD"
  | "COMMANDS"
  | "WHITELIST"
  | "FAQ"
  | "GENERAL"
  | "WELCOME_ROOM"
  | "FEEDBACK"
  | "HALL_OF_PRIVACY"
  | "TOWN_SQUARE"
  | "METRO"
  | "TAVERN"
  | "HALL_OF_ALLEIGANCE"
  | "MART"
  | "ARMORY"
  | "TOSS_HOUSE"
  | "BANK"
  | "ARENA"
  | "TRAINING_DOJO"
  | "GEN_POP"
  | "SOLITARY"
  | DormitorySymbol;

export type ManagedCategorySymbol =
  | "THE_GAME"
  | "COMMAND_CENTER"
  | "COMMUNITY"
  | "BEAUTOPIA"
  | `THE_PROJECTS_${DistrictSymbol}`
  | "THE_SHELTERS"
  | "PRISON";

export type ManagedChannelSymbol =
  | NestedManagedChannelSymbol
  | ManagedCategorySymbol;

@Entity()
export class ManagedChannel extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: ManagedChannelSymbol;

  @OneToOne(() => DiscordChannel, { cascade: true, eager: true })
  @JoinColumn()
  discordChannel: DiscordChannel;

  @Column()
  type: "CATEGORY" | "CHANNEL";

  name: string;
  lockPermissions: boolean;
  permissionOverwrites: {
    id: RoleSymbol;
    allow?: PermissionString[];
    deny?: PermissionString[];
  }[];

  @OneToMany(() => ManagedChannel, (channel) => channel.parent, {
    cascade: true,
  })
  @Type(() => ManagedChannel)
  children: ManagedChannel[];

  @ManyToOne(() => ManagedChannel, (channel) => channel.children, {
    nullable: true,
  })
  parent: ManagedChannel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  isChannel(): this is typeof ManagedChannel & {
    id: NestedManagedChannelSymbol;
  } {
    return this.type === "CHANNEL";
  }
}
