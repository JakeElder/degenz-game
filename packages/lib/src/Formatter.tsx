import pluralize from "pluralize";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TurndownService from "turndown";

TurndownService.prototype.escape = (s) => s;
const td = new TurndownService();

export default class Formatter {
  static r(e: React.ReactElement) {
    const md = td.turndown(renderToStaticMarkup(e));
    return md;
  }

  static codeBlock(content: string | number) {
    return `\`\`\`${content}\`\`\``;
  }

  static currency(
    amount: number | null,
    props: {
      emoji?: boolean | string;
      symbol?: boolean;
      bold?: boolean;
      full?: boolean;
      plural?: boolean;
      bare?: boolean;
      symbolCode?: boolean;
    } = {}
  ) {
    const { symbol, emoji, bold, full, plural, bare, symbolCode } = {
      symbol: true,
      emoji: true,
      bold: true,
      full: false,
      bare: false,
      symbolCode: true,
      ...props,
    };

    if (bare && amount !== null) {
      return amount.toLocaleString();
    }

    let base = full ? "GoodBoyToken" : "$GBT";

    if (full && (amount !== null || plural)) {
      base = pluralize(base);
    }

    if (amount === null) {
      if (emoji) {
        const e = typeof emoji === "boolean" ? "\u{1f4b0}" : emoji;
        return `\`${e}${base}\``;
      }
      return base;
    }

    let t = `${amount.toLocaleString()}`;

    if (bold) {
      t = `**${t}**`;
    }

    if (symbol) {
      t += symbolCode ? ` \`${base}\`` : ` ${base}`;
    }

    if (emoji) {
      t = `\`\u{1f4b0}\` ${t}`;
    }

    return t;
  }

  static token(...args: any[]) {
    return "$GBT";
  }

  static worldName() {
    return "Beautopia";
  }

  static transaction(initial: number, net: number) {
    return this.r(
      <>
        {this.currency(initial, { symbol: false })} **{"\u22d9"}**{" "}
        {this.currency(initial + net, { symbol: false })} `(
        {net > 0 ? "+" : ""}
        {this.currency(net, {
          emoji: false,
          symbol: true,
          symbolCode: false,
          bold: false,
        })}
        )`
      </>
    );
  }
}
