import Config from "app-config";
import AdminBot from "../bots/AdminBot";

export default class WaitingRoomController {
  static async setStatus(open: boolean, admin: AdminBot) {
    const room = await admin.getTextChannel(Config.channelId("WAITING_ROOM"));

    const disabled = `\u{1f538}\uff5cwaiting-room`;
    const enabled = `\u{1f7e2}\uff5cwaiting-room`;

    await room.edit({ name: open ? enabled : disabled });
  }
}
