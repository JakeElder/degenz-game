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

  static currency(
    amount: number | null,
    props: { emoji?: boolean; symbol?: boolean; bold?: boolean } = {}
  ) {
    const { symbol, emoji, bold } = {
      symbol: true,
      emoji: true,
      bold: true,
      ...props,
    };

    if (amount === null) {
      return "$GBT";
    }

    let t = `${amount}`;

    if (bold) {
      t = `**${t}**`;
    }

    if (symbol) {
      t += " `$GBT`";
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
        {this.currency(net, { emoji: false, symbol: false, bold: false })})`
      </>
    );
  }
}
