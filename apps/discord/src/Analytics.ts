import { Events } from "./Events";
import Mixpanel from "mixpanel";
import Config from "app-config";
import { capitalCase } from "change-case";

type Event<T extends keyof Events> = Parameters<Events[T]>[0];

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

  static enter(e: Event<"ENTER">) {
    const [$first_name, $last_name] = e.data.member.user.tag.split("#");
    this.mixpanel.people.set(e.data.member.id, {
      $first_name,
      $last_name,
      $name: e.data.member.displayName,
      $avatar: e.data.member.displayAvatarURL({ size: 256, format: "png" }),
    });
  }

  static verify(e: Event<"MEMBER_VERIFIED">) {
    this.generic(capitalCase("VERIFY"), e.data.member.id);
  }

  static redpillTaken(e: Event<"REDPILL_TAKEN">) {
    this.generic(capitalCase("REDPILL"), e.data.user.discordId);
  }

  static helpRequested(e: Event<"HELP_REQUESTED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.discordId,
      channel_name: e.data.channel.name,
      channel_id: e.data.channel.id,
    });
  }

  static statsChecked(e: Event<"STATS_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.checker.discordId,
      channel_name: e.data.channel.name,
      channel_id: e.data.channel.id,
    });
  }

  static balanceChecked(e: Event<"BALANCE_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.user.discordId,
      balance: e.data.user.gbt,
    });
  }

  static gbtTransferred(e: Event<"GBT_TRANSFERRED">) {
    this.mixpanel.track(capitalCase(e.type), {
      ...this.common,
      distinct_id: e.data.sender.discordId,
      recipient: e.data.recipient.discordId,
      amount: e.data.amount,
    });
  }

  static martStockChecked(e: Event<"MART_STOCK_CHECKED">) {
    this.generic(capitalCase("MART_STOCK_CHECKED"), e.data.user.discordId);
  }

  static martItemBought(e: Event<"MART_ITEM_BOUGHT">) {
    this.mixpanel.track(capitalCase("MART_ITEM_PURCHASED"), {
      distinct_id: e.data.user.discordId,
      item: e.data.item.name,
      price: e.data.item.price,
    });
  }

  static itemEaten(e: Event<"ITEM_EATEN">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.user.discordId,
      item: e.data.item.name,
    });
  }

  static inventoryChecked(e: Event<"INVENTORY_CHECKED">) {
    this.mixpanel.track(capitalCase(e.type), {
      distinct_id: e.data.checker.discordId,
      checkee_id: e.data.checkee.discordId,
      checkee_name: e.data.checkee.displayName,
      own: e.data.checker.id === e.data.checkee.id,
    });
  }

  static tossCompleted(e: Event<"TOSS_COMPLETED">) {
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

  // logToMixpanel(e: WorldEventMessage) {
  //   const mixPanelEvents: WorldEventId[] = [
  //     "VERIFY", X
  //     "OBEY", -X
  //     "REDPILL", X
  //     "HELP_REQUESTED", X
  //     "STATS_CHECKED", X
  //     "BALANCE_CHECKED", X
  //     "TOKEN_TRANSFER", X
  //     "MART_STOCK_CHECKED", X
  //     "MART_ITEM_PURCHASED", X
  //     "ITEM_EATEN", X
  //     "INVENTORY_CHECKED", X
  //     "TOSS_COMPLETED",
  //     "FIRST_WORLD_CHOICE",
  //   ];

  //   if (mixPanelEvents.includes(e.event)) {
  //     if (e.event === "ENTER") {
  //     }

  //     if (e.event === "HELP_REQUESTED") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         channel_name: (e.data.channel as TextChannel).name,
  //         channel_id: e.data.channel.id,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     if (e.event === "BALANCE_CHECKED") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         balance: e.data.balance,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     if (e.event === "TOKEN_TRANSFER") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         recipient: e.data.recipient.id,
  //         amount: e.data.amount,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     if (e.event === "MART_ITEM_PURCHASED") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         item: e.data.item.name,
  //         price: e.data.item.price,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     if (e.event === "ITEM_EATEN") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         item: e.data.item.name,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     if (e.event === "STATS_CHECKED") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         checkee_id: e.data.checkee === null ? null : e.data.checkee.id,
  //         checkee_name:
  //           e.data.checkee === null ? null : e.data.checkee.displayName,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     if (e.event === "INVENTORY_CHECKED") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         checkee_id: e.data.checkee === null ? null : e.data.checkee.id,
  //         checkee_name:
  //           e.data.checkee === null ? null : e.data.checkee.displayName,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     if (e.event === "TOSS_COMPLETED") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         challengee_id: e.data.challengee.member.id,
  //         challengee_name: e.data.challengee.member.displayName,
  //         amount: e.data.amount,
  //         winner: e.data.winner,
  //         result: e.data.result,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     if (e.event === "FIRST_WORLD_CHOICE") {
  //       mixpanel.track(capitalCase(e.event), {
  //         distinct_id: e.data.member.id,
  //         guild_id: GUILD_ID,
  //         choice: e.data.choice,
  //         env: NODE_ENV,
  //       });
  //       return;
  //     }

  //     mixpanel.track(capitalCase(e.event), {
  //       distinct_id: e.data.member.id,
  //       guild_id: GUILD_ID,
  //       env: NODE_ENV,
  //     });
  //   }
  // }
}
