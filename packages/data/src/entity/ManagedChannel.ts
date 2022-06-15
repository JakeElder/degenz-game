import { PermissionOverwriteOptions } from "discord.js";
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

export type ManagedCategorySymbol =
  | "THE_GAME"
  | "COMMAND_CENTER"
  | "COMMUNITY"
  | "BEAUTOPIA"
  | `THE_PROJECTS_${DistrictSymbol}`
  | "THE_SHELTERS"
  | "TICKETS"
  | "ORIENTATION"
  | "PRISON"
  | "STAFF_ROOM";

export type NestedManagedChannelSymbol =
  | "ENTRANCE"
  | "STAFF_CHAT"
  | "QUESTS"
  | "THE_LORE"
  | "NFT_CHARACTERS"
  | "ANNOUNCEMENTS"
  | "GIVEAWAYS"
  | "VIP_LOUNGE"
  | "UPDATES"
  | "OFFICIAL_LINKS"
  | "QUEST_COMPLETION_PROOF"
  | "LEVEL_REWARDS"
  | "LEADERBOARD"
  | "SNEAK_PEEKS"
  | "CHECK_RANK"
  | "SLOT_MACHINE"
  | "INVITE"
  | "GIVEAWAYS"
  | "JPEG_STORE"
  | "TWEETS"
  | "RAIDS"
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
  | "SUPPORT"
  | "SUBMIT_WALLET"
  | "ROADMAP"
  | DormitorySymbol;

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
    roles: RoleSymbol[];
    options: PermissionOverwriteOptions;
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
