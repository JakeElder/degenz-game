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

  // logToMixpanel(e: WorldEventMessage) {
  //   const mixPanelEvents: WorldEventId[] = [
  //     "VERIFY", X
  //     "OBEY", -X
  //     "REDPILL", X
  //     "HELP_REQUESTED", X
  //     "STATS_CHECKED",
  //     "BALANCE_CHECKED",
  //     "TOKEN_TRANSFER",
  //     "MART_STOCK_CHECKED",
  //     "MART_ITEM_PURCHASED",
  //     "ITEM_EATEN",
  //     "INVENTORY_CHECKED",
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
