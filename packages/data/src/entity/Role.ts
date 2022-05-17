import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Permissions } from "discord.js";
import { Emoji } from "..";
import { EngagementLevel } from "../types";

export type RoleTypeSymbol =
  | "EVERYONE"
  | "BASE"
  | "CITIZEN"
  | "SUPPLEMENTARY"
  | "MANAGED";

export type EveryoneRoleSymbol = "EVERYONE";

export type BaseRoleSymbol =
  | "VERIFIED"
  | "PREGEN"
  | "DEGEN"
  | "PRISONER"
  | "ESTABLISHMENT";

export type ManagedRoleSymbol =
  | "ADMIN_BOT"
  | "ALLY_BOT"
  | "ARMORY_CLERK_BOT"
  | "BANKER_BOT"
  | "BIG_BROTHER_BOT"
  | "DEVILS_ADVOCATE_BOT"
  | "MART_CLERK_BOT"
  | "PRISONER_BOT"
  | "RESISTANCE_LEADER_BOT"
  | "SCOUT_BOT"
  | "SENSEI_BOT"
  | "TOSSER_BOT"
  | "WARDEN_BOT";

export type SupplementaryRoleSymbol =
  | "ADMIN"
  | "SERVER_BOOSTER"
  | "TRAINEE"
  | "THOUGHT_POLICE"
  | "WHITELIST"
  | "HACKER"
  | "HIGH_COMMAND"
  | "MODS"
  | "VIP"
  | `ENGAGEMENT_LEVEL_${EngagementLevel}`;

export type CitizenRoleSymbol =
  | "D1_CITIZEN"
  | "D2_CITIZEN"
  | "D3_CITIZEN"
  | "D4_CITIZEN"
  | "D5_CITIZEN"
  | "D6_CITIZEN"
  | "THE_LEFT_CITIZEN"
  | "THE_RIGHT_CITIZEN"
  | "THE_GRID_CITIZEN"
  | "BULLSEYE_CITIZEN"
  | "VULTURE_CITIZEN";

export type RoleSymbol =
  | EveryoneRoleSymbol
  | BaseRoleSymbol
  | ManagedRoleSymbol
  | SupplementaryRoleSymbol
  | CitizenRoleSymbol;

@Entity()
export class Role extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: RoleSymbol;

  @Column({ type: 'varchar' })
  type: RoleTypeSymbol;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  discordId: string;

  @Column({ nullable: true })
  color: string;

  @OneToOne(() => Emoji, { eager: true })
  @JoinColumn()
  emoji: Emoji;

  permissions?: Permissions;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
