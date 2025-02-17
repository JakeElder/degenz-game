import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryColumn,
} from "typeorm";

type AppStateSymbol = "CURRENT";

@Entity()
export class AppState extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: AppStateSymbol;

  @Column({ default: 1 })
  dormitoryCapacity: number;

  @Column({ default: true })
  sheltersOpen: boolean;

  @Column({ default: false })
  transferEnabled: boolean;

  @Column({ default: 0 })
  announcementCount: number;

  @Column({ default: false })
  linksDisabled: boolean;

  @Column({ default: "" })
  countChannelId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async fetch() {
    return this.findOneOrFail({ where: { id: "CURRENT" } });
  }

  static async increaseDormitoryCapacity(amount: number) {
    const state = await this.fetch();
    state.dormitoryCapacity += amount;
    await state.save();
  }
}
