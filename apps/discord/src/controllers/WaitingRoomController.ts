import Config from "app-config";
import { Global } from "../Global";

export default class WaitingRoomController {
  static async setStatus(open: boolean, t: number = 0) {
    const admin = Global.bot("ADMIN");
    const room = await admin.getTextChannel(Config.channelId("WAITING_ROOM"));

    const disabled = `\u{1f512}\uff5cwaiting-room`;
    const enabled = `\u{1f513}\uff5cwaiting-room`;

    // const handleResponse: Parameters<Client["on"]>[1] = (req, res) => {
    //   if (req.path === `/channels/${Config.channelId("WAITING_ROOM")}`) {
    //     console.log(res.status);
    //     if (res.status === 429) {
    //       console.log(res.headers.get("x-ratelimit-reset-after"));
    //     }
    //     admin.client.off("apiResponse", handleResponse);
    //   }
    // };

    // admin.client.on("apiResponse", handleResponse);

    const newName = open ? enabled : disabled;

    if (room.name != newName) {
      await room.edit({ name: newName });
    }
  }
}
