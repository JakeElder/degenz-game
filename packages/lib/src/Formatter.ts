export default class Formatter {
  static format(...args: any[]): any {
    return;
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
}
