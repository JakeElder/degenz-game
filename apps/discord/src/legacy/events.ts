import { GuildMember, TextChannel } from "discord.js";
import EE from "events";
import TypedEmitter from "typed-emitter";
import { Invite } from "./types";

////////////////////////////////////////////////////////////////////////////////
// Banker Beatrice
////////////////////////////////////////////////////////////////////////////////

export type SuccessfulTransferEvent = {
  result: "SUCCESS";
  sender: GuildMember;
  recipient: GuildMember;
  amount: number;
};

export type FailedTransferEvent = {
  result: "FAIL";
  error: "RECIPIENT_NOT_FOUND" | "INSUFFICIENT_BALANCE";
  sender: GuildMember;
  recipient: GuildMember | null;
  amount: number;
};

////////////////////////////////////////////////////////////////////////////////
// Tosser Ted
////////////////////////////////////////////////////////////////////////////////

export type FailedTossEvent = {
  result: "FAIL";
  error: "INSUFFICIENT_BALANCE";
  challenger: GuildMember;
  challengee: GuildMember;
  amount: number;
  rake: number;
};

export type SuccessfulTossEvent = {
  result: "SUCCESS";
  winner: "CHALLENGER" | "CHALLENGEE";
  challenger: GuildMember;
  challengee: GuildMember;
  amount: number;
  rake: number;
};

export type ApartmentAllocatedEvent = {
  member: GuildMember;
  apartmentId: TextChannel["id"];
};

////////////////////////////////////////////////////////////////////////////////
// Big Brother
////////////////////////////////////////////////////////////////////////////////

export type ImprisonEvent = {
  member: GuildMember;
};

export type ReleaseEvent = {
  member: GuildMember;
};

export type EnterEvent = {
  citizen: GuildMember;
  inviteId: Invite["id"] | null;
};

export type BigBrotherOnboardComplete = {
  member: GuildMember;
  apartmentId: TextChannel["id"];
};

////////////////////////////////////////////////////////////////////////////////
// Hugh Donie
////////////////////////////////////////////////////////////////////////////////

export type EscapeEvent = {
  citizen: GuildMember;
};

////////////////////////////////////////////////////////////////////////////////
// Output
////////////////////////////////////////////////////////////////////////////////

export type Events = {
  TRANSFER: (data: SuccessfulTransferEvent | FailedTransferEvent) => void;
  TOSS: (data: FailedTossEvent | SuccessfulTossEvent) => void;
  IMPRISON: (data: ImprisonEvent) => void;
  RELEASE: (data: ReleaseEvent) => void;
  ESCAPE: (data: EscapeEvent) => void;
  ENTER: (data: EnterEvent) => void;
  APARTMENT_ALLOCATED: (data: ApartmentAllocatedEvent) => void;
  BB_ONBOARD_COMPLETE: (data: BigBrotherOnboardComplete) => void;
};

const events = new EE() as TypedEmitter<Events>;

export const emit = events.emit.bind(events);
export const on = events.on.bind(events);
