import { PickEvent } from "./Events";
import Mixpanel from "mixpanel";
import Config from "config";
import { capitalCase } from "change-case";

export default class Analytics {
  static mixpanel = Mixpanel.init(Config.env("MIXPANEL_PROJECT_TOKEN"));
  static common = {
    guild_id: Config.env("GUILD_ID"),
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

    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.member.id,
      invite_code: e.data.inviteCode,
      campaign: e.data.campaign,
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
      e.data.user.id,
      e.data.user.displayName
    );
  }

  static helpRequested(e: PickEvent<"HELP_REQUESTED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      channel_name: e.data.channel.name,
      channel_id: e.data.channel.id,
    });
  }

  static statsChecked(e: PickEvent<"STATS_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.checker.id,
      user_display_name: e.data.checker.displayName,
      channel_name: e.data.channel.name,
      channel_id: e.data.channel.id,
    });
  }

  static balanceChecked(e: PickEvent<"BALANCE_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      balance: e.data.user.gbt,
    });
  }

  static gbtTransferred(e: PickEvent<"GBT_TRANSFERRED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.sender.id,
      user_display_name: e.data.sender.displayName,
      recipient: e.data.recipient.id,
      amount: e.data.amount,
    });
  }

  static martStockChecked(e: PickEvent<"MART_STOCK_CHECKED">) {
    this.generic(
      capitalCase("MART_STOCK_CHECKED"),
      e.data.user.id,
      e.data.user.displayName
    );
  }

  static martItemBought(e: PickEvent<"MART_ITEM_BOUGHT">) {
    this.mixpanel.track(capitalCase("MART_ITEM_PURCHASED"), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      item: e.data.item.name,
      price: e.data.item.price,
    });
  }

  static itemEaten(e: PickEvent<"ITEM_EATEN">) {
    e.data.items.forEach((item) => {
      this.mixpanel.track(capitalCase(e.type), {
        ...this.common,
        distinct_id: e.data.user.id,
        user_display_name: e.data.user.displayName,
        item,
      });
    });
  }

  static inventoryChecked(e: PickEvent<"INVENTORY_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.checker.id,
      user_display_name: e.data.checker.displayName,
      checkee_id: e.data.checkee.id,
      checkee_name: e.data.checkee.displayName,
      own: e.data.checker.id === e.data.checkee.id,
    });
  }

  static tossCompleted(e: PickEvent<"TOSS_COMPLETED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.toss.challenger.id,
      user_display_name: e.data.toss.challenger.displayName,
      challengee_id: e.data.toss.challengee.id,
      challengee_name: e.data.toss.challengee.displayName,
      amount: e.data.toss.amount,
      outcome: e.data.toss.outcome,
    });
  }

  static firstWorldChoice(e: PickEvent<"FIRST_WORLD_CHOICE">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      choice: e.data.choice,
    });
  }

  static allegiancePledged(e: PickEvent<"ALLEGIANCE_PLEDGED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      yld: e.data.yld,
    });
  }

  static gameEnteredApartment(e: PickEvent<"GAME_ENTERED_APARTMENT">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      district: e.data.district.id,
    });
  }

  static gameEnteredDormitory(e: PickEvent<"GAME_ENTERED_DORMITORY">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      district: e.data.dormitory.id,
    });
  }

  static achievementAwarded(e: PickEvent<"ACHIEVEMENT_AWARDED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      achievement: e.data.achievement,
    });
  }

  static dormReadyButtonPressed(e: PickEvent<"DORM_READY_BUTTON_PRESSED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      response: e.data.response,
    });
  }

  static onboardingThreadPurged(e: PickEvent<"ONBOARDING_THREAD_PURGED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
      user_display_name: e.data.user.displayName,
      redpilled: e.data.redpilled,
    });
  }

  static tokensIssued(e: PickEvent<"TOKENS_ISSUED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.issuerId,
      recipient: e.data.recipient?.id || null,
      amount: e.data.amount,
    });
  }

  static tokensConfiscated(e: PickEvent<"TOKENS_CONFISCATED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.confiscaterId,
      user: e.data.user,
      amount: e.data.amount,
    });
  }

  static citizenImprisoned(e: PickEvent<"CITIZEN_IMPRISONED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.prisoner.id,
      captor: e.data.captor.id,
      reason: e.data.reason,
    });
  }

  static citizenEscaped(e: PickEvent<"CITIZEN_ESCAPED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.prisoner.id,
    });
  }

  static citizenReleased(e: PickEvent<"CITIZEN_RELEASED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.prisoner.id,
      captor: e.data.captor.id,
    });
  }

  static getPFPButtonClicked(e: PickEvent<"GET_PFP_BUTTON_CLICKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.id,
    });
  }

  static messageDeleted(e: PickEvent<"MESSAGE_DELETED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.userId,
      message: e.data.message,
    });
  }
}
