import { OverwriteResolvable, Permissions } from "discord.js";
import { resolvableToOverwrite } from "../../src/utils";

const p: OverwriteResolvable = {
  id: "936810600766525501",
  deny: ["SEND_MESSAGES", "CREATE_PUBLIC_THREADS", "USE_APPLICATION_COMMANDS"],
};

describe("resolve", () => {
  it("does a thing", () => {
    expect(resolvableToOverwrite(p)).toStrictEqual({
      id: "936810600766525501",
      type: 0,
      allow: BigInt(0).toString(),
      deny: (
        BigInt(0) |
        Permissions.FLAGS.SEND_MESSAGES |
        Permissions.FLAGS.CREATE_PUBLIC_THREADS |
        Permissions.FLAGS.USE_APPLICATION_COMMANDS
      ).toString(),
    });
  });
});
