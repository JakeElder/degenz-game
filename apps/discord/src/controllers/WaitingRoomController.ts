import Config from "app-config";
import AdminBot from "../bots/AdminBot";

export default class WaitingRoomController {
  static async setStatus(open: boolean, admin: AdminBot, t: number = 0) {
    const room = await admin.getTextChannel(Config.channelId("WAITING_ROOM"));

    const disabled = `\u{1f538}\uff5cwaiting-room`;
    const enabled = `\u{1f7e2}\uff5cwaiting-room`;

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

    await room.edit({ name: open ? enabled : disabled });
  }
}
