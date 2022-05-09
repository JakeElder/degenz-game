import { User } from "data/db";
import React from "react";
import Utils from "../Utils";

const { r } = Utils;

export default class WelcomeRoomController {
  static async welcome(user: User) {
    const channel = await Utils.ManagedChannel.getOrFail(
      "WELCOME_ROOM",
      "BIG_BROTHER"
    );
    await channel.send(
      r(
        <>
          `SERVER_JOINED` **{user.displayName}** joined the server. **WELCOME,
          COMRADE**.
        </>
      )
    );
  }
}
