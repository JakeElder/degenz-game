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

  static generic(event: string, id: string, displayName: string) {
    this.mixpanel.track(event, {
      ...this.common,
      distinct_id: id,
      user_display_name: displayName,
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

  static exit(e: PickEvent<"EXIT">) {
    this.generic(
      capitalCase(e.type),
      e.data.member.id,
      e.data.member.displayName
    );
  }

  static verify(e: PickEvent<"MEMBER_VERIFIED">) {
    this.generic(
      capitalCase("VERIFY"),
      e.data.member.id,
      e.data.member.displayName
    );
  }

  static redpillTaken(e: PickEvent<"REDPILL_TAKEN">) {
    this.generic(
      capitalCase("REDPILL"),
      e.data.user.discordId,
      e.data.user.displayName
    );
  }

  static helpRequested(e: PickEvent<"HELP_REQUESTED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      channel_name: e.data.channel.name,
      channel_id: e.data.channel.id,
    });
  }

  static statsChecked(e: PickEvent<"STATS_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.checker.discordId,
      user_display_name: e.data.checker.displayName,
      channel_name: e.data.channel.name,
      channel_id: e.data.channel.id,
    });
  }

  static balanceChecked(e: PickEvent<"BALANCE_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      balance: e.data.user.gbt,
    });
  }

  static gbtTransferred(e: PickEvent<"GBT_TRANSFERRED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.sender.discordId,
      user_display_name: e.data.sender.displayName,
      recipient: e.data.recipient.discordId,
      amount: e.data.amount,
    });
  }

  static martStockChecked(e: PickEvent<"MART_STOCK_CHECKED">) {
    this.generic(
      capitalCase("MART_STOCK_CHECKED"),
      e.data.user.discordId,
      e.data.user.displayName
    );
  }

  static martItemBought(e: PickEvent<"MART_ITEM_BOUGHT">) {
    this.mixpanel.track(capitalCase("MART_ITEM_PURCHASED"), {
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      item: e.data.item.name,
      price: e.data.item.price,
    });
  }

  static itemEaten(e: PickEvent<"ITEM_EATEN">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      item: e.data.item.name,
    });
  }

  static inventoryChecked(e: PickEvent<"INVENTORY_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.checker.discordId,
      user_display_name: e.data.checker.displayName,
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
      user_display_name: e.data.challenger.displayName,
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
      user_display_name: e.data.user.displayName,
      choice: e.data.choice,
    });
  }

  static allegiancePledged(e: PickEvent<"ALLEGIANCE_PLEDGED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      yld: e.data.yld,
    });
  }

  static gameEnteredApartment(e: PickEvent<"GAME_ENTERED_APARTMENT">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      district: e.data.district.symbol,
    });
  }

  static gameEnteredDormitory(e: PickEvent<"GAME_ENTERED_DORMITORY">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      district: e.data.dormitory.symbol,
    });
  }

  static achievementAwarded(e: PickEvent<"ACHIEVEMENT_AWARDED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      achievement: e.data.achievement,
    });
  }

  static dormReadyButtonPressed(e: PickEvent<"DORM_READY_BUTTON_PRESSED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      response: e.data.response,
    });
  }

  static onboardingThreadPurged(e: PickEvent<"ONBOARDING_THREAD_PURGED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      user_display_name: e.data.user.displayName,
      redpilled: e.data.redpilled,
    });
  }

  static tokensIssued(e: PickEvent<"TOKENS_ISSUED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.issuerId,
      recipient: e.data.recipient?.discordId || null,
      amount: e.data.amount,
    });
  }
}
