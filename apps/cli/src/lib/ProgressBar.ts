import progress from "cli-progress";
import chalk from "chalk";
import { nl } from "../utils";

export default class ProgressBar<T extends string = string> {
  symbols: string[];
  lastComplete: string | null = null;
  bar: progress.SingleBar;
  timeout: null | NodeJS.Timeout = null;
  remainingLimit: null | number = null;
  completeCount = 0;

  constructor(symbols: T[]) {
    this.symbols = symbols;

    this.bar = new progress.SingleBar({
      format: `${chalk.yellow(
        "{bar}"
      )} | {percentage}% | {value}/{total} | {symbol} | Rate Limit: {rl}`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      stopOnComplete: true,
    });
  }

  rateLimit(time: number) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.remainingLimit = time;
    this.update();
    this.timeout = setTimeout(() => this.tick(), 1000);
  }

  tick() {
    this.remainingLimit! -= 1000;
    if (this.remainingLimit! > 0) {
      this.timeout = setTimeout(() => this.tick(), 1000);
    } else {
      this.remainingLimit = null;
    }
    this.update();
  }

  private get currentRateLimit() {
    return this.remainingLimit === null
      ? "N/A"
      : `${Math.round(this.remainingLimit / 1000).toLocaleString()} seconds`;
  }

  start() {
    nl();
    this.bar.start(this.symbols.length, 0, { symbol: "-", rl: "N/A" });
  }

  update() {
    this.bar.update(this.completeCount, {
      symbol: this.lastComplete ? this.lastComplete : "-",
      rl: this.currentRateLimit,
    });
  }

  complete(symbol: T) {
    this.bar.increment({ symbol: symbol, rl: this.currentRateLimit });
    this.lastComplete = symbol;
    this.completeCount++;
  }

  stop() {
    this.bar.stop();
    nl();
  }
}
