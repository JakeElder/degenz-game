import { inspect } from "util";

export function json(data: any) {
  return inspect(data, { colors: true });
}
