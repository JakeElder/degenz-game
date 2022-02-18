import { GuildMember } from "discord.js";
import {
  Achievement,
  AppState,
  Imprisonment,
  MartItem,
  MartItemOwnership,
  Tenancy,
  User,
} from "db";
import { Achievement as AchievementEnum } from "types";
import { DistrictId, TenancyType } from "types";
import { In } from "typeorm";

export async function getMartItems() {
  return MartItem.find({ order: { price: -1 } });
}

export async function getLeaders(take: number = 50) {
  return User.find({ order: { gbt: -1 }, take });
}

export async function getUser(id: string) {
  return User.findOneOrFail({
    where: { discordId: id },
    relations: [
      "tenancies",
      "imprisonments",
      "achievements",
      "martItemOwnerships",
    ],
  });
}

export async function getUsers() {
  return User.find({
    relations: [
      "tenancies",
      "imprisonments",
      "achievements",
      "martItemOwnerships",
    ],
  });
}

export async function getOpenDistrict() {
  return AppState.openDistrict();
}

export async function setOpenDistrict(districtId: DistrictId | null) {
  return AppState.openDistrict(districtId);
}

export async function getTenanciesInDistrict(districtId: DistrictId) {
  return Tenancy.count({ where: { district: districtId } });
}

export async function getUserByApartment(id: string) {
  const t = await Tenancy.findOne({
    relations: ["user"],
    where: { discordChannelId: id, type: TenancyType.AUTHORITY },
  });
  return t?.user;
}

export async function eatItem(
  itemSymbol: MartItem["symbol"],
  memberId: User["discordId"]
) {
  const item = await MartItem.findOne({ where: { symbol: itemSymbol } });

  if (!item) {
    return { success: false, code: "ITEM_NOT_FOUND" };
  }

  const user = await User.findOne({ where: { discordId: memberId } });

  if (!user) {
    return { success: false, code: "USER_NOT_FOUND" };
  }

  const ownership = await MartItemOwnership.findOne({
    where: { item, user },
  });

  if (!ownership) {
    return { success: false, code: "NOT_IN_INVENTORY" };
  }

  user.strength = Math.max(
    Math.min(100, user.strength + item.strengthIncrease),
    0
  );

  await Promise.all([ownership.softRemove(), user.save()]);

  return { success: true };
}

export async function sellItem(item: MartItem, memberId: User["discordId"]) {
  if (item.stock === 0) {
    return { success: false, code: "ITEM_NO_STOCK" };
  }

  const user = await User.findOneOrFail({ where: { discordId: memberId } });

  if (user.gbt < item.price) {
    return { success: false, code: "INSUFFICIENT_BALANCE" };
  }

  item.stock -= 1;
  user!.gbt -= item.price;

  await Promise.all([
    item.save(),
    user!.save(),
    MartItemOwnership.insert({ user, item }),
  ]);

  return { success: true };
}

export async function addUser({
  member,
  apartmentId,
  districtId,
  tokens = 0,
}: {
  member: GuildMember;
  apartmentId: string;
  districtId: DistrictId;
  tokens?: number;
}) {
  const user = User.create({
    discordId: member.id,
    displayName: member.displayName,
    gbt: tokens,
    strength: 100,
    tenancies: [
      {
        discordChannelId: apartmentId,
        type: TenancyType.AUTHORITY,
        district: districtId,
      },
    ],
  });
  await user.save({ reload: true });
  return user;
}

export async function deleteUser(member: GuildMember) {
  const user = await User.findOneOrFail({ where: { discordId: member.id } });
  await user.remove();
}

export async function getAvailableCellNumber() {
  const imprisonments = await Imprisonment.find();

  if (imprisonments.length === 0) {
    return 1;
  }

  let num = 1;

  for (let i = 0; i < imprisonments.length; i++) {
    if (imprisonments[i].cellNumber === num) {
      num++;
    } else {
      break;
    }
  }

  return num;
}

export async function addAchievement(
  memberId: string,
  symbol: AchievementEnum
) {
  const user = await User.findOne({
    where: { discordId: memberId },
    relations: ["achievements"],
  });
  const achievement = await Achievement.findOne({ where: { symbol } });
  user!.achievements.push(achievement!);
  user!.save();
}

export async function transactBalance(memberId: string, amount: number) {
  const user = await User.findOne({ where: { discordId: memberId } });
  user!.gbt += amount;
  await user!.save();
}

export async function incStrength(amount: number) {
  await User.createQueryBuilder()
    .update(User)
    .set({ strength: () => `GREATEST(strength + ${amount}, 0)` })
    .execute();
}

export async function issueTokens(amount: number) {
  await User.createQueryBuilder()
    .update(User)
    .set({ gbt: () => `gbt + ${amount}` })
    .execute();
}

export async function getImprisonmentByCellChannelId(id: string) {
  return Imprisonment.findOne({ where: { cellDiscordChannelId: id } });
}

export async function transferBalance(
  senderId: string,
  recipientId: string,
  amount: number
) {
  const users = await User.find({
    where: { discordId: In([senderId, recipientId]) },
  });

  const sender = users.find((u) => u.discordId === senderId);
  const recipient = users.find((u) => u.discordId === recipientId);

  if (!sender || !recipient) {
    throw new Error("Transfer users not established");
  }

  sender.gbt -= amount;
  recipient.gbt += amount;

  await Promise.all([sender.save(), recipient.save()]);
}
