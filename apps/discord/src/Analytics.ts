import { PickEvent } from "./Events";
import Mixpanel from "mixpanel";
import Config from "config";
import { capitalCase } from "change-case";

export default class Analytics {
  static mixpanel = Mixpanel.init(Config.env("MIXPANEL_PROJECT_TOKEN"));
  static common = {
    guild_id: Config.general("GUILD_ID"),
    env: Config.env("NODE_ENV"),
  };

  static generic(event: string, id: string) {
    this.mixpanel.track(event, {
      ...this.common,
      distinct_id: id,
    });
  }

  static enter(e: PickEvent<"ENTER">) {
    const [$first_name, $last_name] = e.data.member.user.tag.split("#");
    this.mixpanel.people.set(e.data.member.id, {
      $first_name,
      $last_name,
      $name: e.data.member.displayName,
      $avatar: e.data.member.displayAvatarURL({ size: 256, format: "png" }),
    });
  }

  static verify(e: PickEvent<"MEMBER_VERIFIED">) {
    this.generic(capitalCase("VERIFY"), e.data.member.id);
  }

  static redpillTaken(e: PickEvent<"REDPILL_TAKEN">) {
    this.generic(capitalCase("REDPILL"), e.data.user.discordId);
  }

  static helpRequested(e: PickEvent<"HELP_REQUESTED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.discordId,
      channel_name: e.data.channel.name,
      channel_id: e.data.channel.id,
    });
  }

  static statsChecked(e: PickEvent<"STATS_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.checker.discordId,
      channel_name: e.data.channel.name,
      channel_id: e.data.channel.id,
    });
  }

  static balanceChecked(e: PickEvent<"BALANCE_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.discordId,
      balance: e.data.user.gbt,
    });
  }

  static gbtTransferred(e: PickEvent<"GBT_TRANSFERRED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.sender.discordId,
      recipient: e.data.recipient.discordId,
      amount: e.data.amount,
    });
  }

  static martStockChecked(e: PickEvent<"MART_STOCK_CHECKED">) {
    this.generic(capitalCase("MART_STOCK_CHECKED"), e.data.user.discordId);
  }

  static martItemBought(e: PickEvent<"MART_ITEM_BOUGHT">) {
    this.mixpanel.track(capitalCase("MART_ITEM_PURCHASED"), {
      distinct_id: e.data.user.discordId,
      item: e.data.item.name,
      price: e.data.item.price,
    });
  }

  static itemEaten(e: PickEvent<"ITEM_EATEN">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      item: e.data.item.name,
    });
  }

  static inventoryChecked(e: PickEvent<"INVENTORY_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.checker.discordId,
      checkee_id: e.data.checkee.discordId,
      checkee_name: e.data.checkee.displayName,
      own: e.data.checker.id === e.data.checkee.id,
    });
  }

  static tossCompleted(e: PickEvent<"TOSS_COMPLETED">) {
    const [challengee_id, challengee_name] =
      e.data.challengee === "HOUSE"
        ? ["HOUSE", "HOUSE"]
        : [e.data.challengee.discordId, e.data.challengee.displayName];

    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.challenger.discordId,
      challengee_id,
      challengee_name,
      amount: e.data.game.amount,
      winner: e.data.game.winner,
      result: e.data.game.result,
    });
  }

  static firstWorldChoice(e: PickEvent<"FIRST_WORLD_CHOICE">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      choice: e.data.choice,
    });
  }

  static allegiancePledged(e: PickEvent<"ALLEGIANCE_PLEDGED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      yld: e.data.yld,
    });
  }

  static gameEntered(e: PickEvent<"GAME_ENTERED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      district: e.data.district.symbol,
    });
  }
}
