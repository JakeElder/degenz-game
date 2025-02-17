import {
  Imprisonment,
  MartItem,
  MartItemOwnership,
  ApartmentTenancy,
  User,
} from "data/db";
import { DistrictSymbol } from "data/types";
import { In } from "typeorm";

export async function getLeaders(take: number = 50) {
  return User.find({
    where: { inGame: true },
    order: { gbt: -1 },
    take,
  });
}

export async function getUser(id: string) {
  return User.findOneOrFail({
    where: { id },
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
  return ApartmentTenancy.count({
    where: { district: { id: districtSymbol } },
  });
}

export async function getUserByApartment(id: string) {
  const t = await ApartmentTenancy.findOne({
    relations: ["user"],
    where: { discordChannelId: id, level: "AUTHORITY" },
  });
  return t?.user;
}

export async function sellItem(item: MartItem, memberId: User["id"]) {
  if (item.stock === 0) {
    return { success: false, code: "ITEM_NO_STOCK" };
  }

  const user = await User.findOneOrFail({ where: { id: memberId } });

  if (user.gbt < item.price) {
    return { success: false, code: "INSUFFICIENT_BALANCE" };
  }

  item.stock -= 1;
  user.gbt -= item.price;

  await Promise.all([
    item.save(),
    user.save(),
    MartItemOwnership.insert({
      user: { id: user.id },
      item: { id: item.id },
    }),
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

export async function transactBalance(memberId: string, amount: number) {
  const user = await User.findOne({ where: { id: memberId } });
  user!.gbt += amount;
  await user!.save();
}

export async function issueTokens(amount: number) {
  await User.createQueryBuilder()
    .update(User)
    .set({ gbt: () => `gbt + ${amount}` })
    .execute();
}

export async function transferBalance(
  senderId: string,
  recipientId: string,
  amount: number
) {
  const users = await User.find({
    where: { id: In([senderId, recipientId]) },
  });

  const sender = users.find((u) => u.id === senderId);
  const recipient = users.find((u) => u.id === recipientId);

  if (!sender || !recipient) {
    throw new Error("Transfer users not established");
  }

  sender.gbt -= amount;
  recipient.gbt += amount;

  await Promise.all([sender.save(), recipient.save()]);
}
