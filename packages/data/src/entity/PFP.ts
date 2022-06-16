import { Entity, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class PFP extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: string;
}
