import { GuildMember, TextChannel } from "discord.js";
import ObjectId from "bson-objectid";
import { Long } from "mongodb";

type DiscordId = Long;

type Player = {
  DiscordId: DiscordId;
  Name: string;
  Attacks: any[];
  Defenses: any[];
  Arsenal: any[];
  Bank: number;
};

export type Tosser = {
  member: GuildMember;
  user: User | null;
  balanceAvailable: null | boolean;
};

export type TossGame = {
  amount: number;
  rake: number;
  member: GuildMember;
  challenger: Tosser;
  challengee: Tosser;
  choice: "UNDECIDED" | "HEADS" | "TAILS";
  result: "UNDECIDED" | "HEADS" | "TAILS";
  winner: "UNDECIDED" | "CHALLENGER" | "CHALLENGEE";
  againstHouse: boolean;
  accepted: null | boolean;
};

export type TossResult = {
  challenger: GuildMember;
  challengee: GuildMember;
  winner: "CHALLENGER" | "CHALLENGEE";
  amount: number;
  rake: number;
};

export type PlayerModel = {
  _id?: ObjectId;
  Player: Player;
  tenancies?: Tenancy[];
} & Omit<UserModel, "id" | "tokens">;

export type AggregatedPlayerModel = PlayerModel & {};

export enum Achievement {
  HELP_REQUESTED = "HELP_REQUESTED",
  STATS_CHECKED = "STATS_CHECKED",
  JOINED_THE_DEGENZ = "JOINED_THE_DEGENZ",
  SUPER_OBEDIENT = "SUPER_OBEDIENT",
}

export type UserModel = {
  id: string;
  name: string;
  strength: number;
  items: UserItem[];
  achievements: Achievement[];
  tokens: number;
};

export type User = UserModel & {
  tenancies?: Tenancy[];
};

export type Tenancy = {
  id: string;
  userId: Long;
  memberName: GuildMember["displayName"];
  propertyId: TextChannel["id"];
  tenancyType: "PRIMARY" | "SECONDARY";
  district: 1 | 2 | 3 | 4 | 5 | 6;
  dateCreated: Date;
};

export enum UserItemType {
  MartItem = "MART_ITEM",
}

export type UserItem = {
  itemId: MartItem["id"];
  type: UserItemType;
};

export type MartItem = {
  id: string;
  name: string;
  strengthIncrease: number;
  description: string;
  price: number;
  stock: number;
};

export type Cell = {
  _id?: ObjectId;
  number: number;
  userId: GuildMember["id"];
  cellId: TextChannel["id"] | null;
  entryRoleIds: string[];
};
