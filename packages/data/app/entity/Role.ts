import { Exclude } from "class-transformer";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { RoleSymbol, RoleSymbolEnum, RoleTypeEnum } from "../types";

@Entity()
export class Role extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: RoleSymbolEnum, unique: true })
  symbol: RoleSymbol;

  @Column({ type: "enum", enum: RoleTypeEnum })
  type: `${RoleTypeEnum}`;

  @Column({ nullable: true })
  discordId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
