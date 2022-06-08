import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";

export type EmojiSymbol =
  | "ALLY_NPC"
  | "ANON"
  | "ARMORY_CLERK_NPC"
  | "BABY"
  | "BANKER_NPC"
  | "BB"
  | "BIG_BROTHER_NPC"
  | "BLUE_TICK"
  | "BULLISH"
  | "BULLSEYE"
  | "BULLSEYE_INACTIVE"
  | "CHICKEN"
  | "CIRCUIT_BOARD"
  | "COIN_HEADS"
  | "COIN_TAILS"
  | "CROWN"
  | "CUPCAKE"
  | "CYPHER_SHIELD"
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D5"
  | "D6"
  | "DEGENZ_RAMEN"
  | "DEVILS_ADVOCATE_NPC"
  | "DOWN_ARROW"
  | "ENCRYPTION_SHIELD"
  | "EYE"
  | "FAT_PIZZA"
  | "FIREWALL_SHIELD"
  | "GBT_COIN"
  | "KEY"
  | "MART_CLERK_NPC"
  | "MEDAL"
  | "MOONSHINE"
  | "NUU_PING"
  | "OBEY"
  | "OLD_TV"
  | "PILL_BOTTLE"
  | "PRISONER_NPC"
  | "RAT"
  | "RED_BLUE_PILLS"
  | "RED_DICE"
  | "ORANGE_TICK"
  | "RED_TICK"
  | "REMOTE_ACCESS"
  | "RESISTANCE_LEADER_NPC"
  | "SENSEI_NPC"
  | "SUNSHINE"
  | "SUSHI"
  | "THE_GRID"
  | "THE_GRID_INACTIVE"
  | "THE_LEFT"
  | "THE_LEFT_INACTIVE"
  | "THE_RIGHT"
  | "THE_RIGHT_INACTIVE"
  | "THOUGHT_POLICE"
  | "TIGER_BLOOD"
  | "TOSSER_NPC"
  | "UP_ARROW"
  | "VIRUS_HACK"
  | "VULTURE"
  | "VULTURE_INACTIVE"
  | "WARDEN_NPC"
  | "WORM_HACK"
  | "POTATO_SACK"
  | "HOT_DOG"
  | "NICK_CAGE"
  | "T_REX"
  | "COOKIE_MONSTER"
  | "WEED_LEAF"
  | "FAT_CAT"
  | "BEARISH"
  | "SNAKEY_SAN"
  | "DRAGON"
  | "DOGE"
  | "APE"
  | "BOB"
  | "PIKA"
  | "GOOCHY"
  | "WHITELIST_BW"
  | "OG_WHITELIST_BW"
  | "WHITELIST"
  | "OG_WHITELIST"
  | "LOADING"
  | "BIG_G";

@Entity()
export class Emoji extends BaseEntity {
  @PrimaryColumn({ type: "varchar", unique: true })
  id: EmojiSymbol;

  @Column()
  name: string;

  @Column()
  identifier: string;

  extension: "png" | "gif" = "png";

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toString() {
    return `<:${this.identifier}>`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      identifier: this.identifier,
      createdAt: this.createdAt.toString(),
      updatedAt: this.updatedAt.toString(),
    };
  }
}
