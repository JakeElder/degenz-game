import {
  Achievement,
  Imprisonment,
  MartItem,
  MartItemOwnership,
  ApartmentTenancy,
  User,
  District,
  DormitoryTenancy,
} from "data/db";
import { DistrictSymbol, Achievement as AchievementEnum } from "data/types";
import { In } from "typeorm";

export async function getMartItems() {
  return MartItem.find({ order: { price: -1 } });
}

export async function getLeaders(take: number = 50) {
  return User.find({
    where: { inGame: true },
    order: { gbt: -1 },
    take,
  });
}

export async function getUser(id: string) {
  return User.findOneOrFail({
    where: { discordId: id },
    relations: [
      "apartmentTenancies",
      "dormitoryTenancy",
      "imprisonments",
      "achievements",
      "martItemOwnerships",
    ],
  });
}

export async function getUsers() {
  return User.find({
    relations: [
      "apartmentTenancies",
      "dormitoryTenancy",
      "imprisonments",
      "achievements",
      "martItemOwnerships",
    ],
  });
}

export async function getTenanciesInDistrict(districtSymbol: DistrictSymbol) {
  const district = await District.findOneOrFail({
    where: { symbol: districtSymbol },
  });
  return ApartmentTenancy.count({ where: { district } });
}

export async function getUserByApartment(id: string) {
  const t = await ApartmentTenancy.findOne({
    relations: ["user"],
    where: { discordChannelId: id, level: "AUTHORITY" },
  });
  return t?.user;
}

export async function getUserByBunk(id: string) {
  const t = await DormitoryTenancy.findOne({
    relations: ["user"],
    where: { bunkThreadId: id },
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
