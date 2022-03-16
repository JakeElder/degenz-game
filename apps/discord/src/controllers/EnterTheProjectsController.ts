import { channelMention, userMention } from "@discordjs/builders";
import Config from "config";
import { ApartmentTenancy, District, User } from "data/db";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageOptions,
} from "discord.js";
import { Format } from "lib";
import { DistrictSymbol } from "data/types";
import axios from "axios";
import { Global } from "../Global";
import UserController from "./UserController";
import Events from "../Events";
import { PersistentMessageController } from "./PersistentMessageController";

type EntryData = {
  open: boolean;
  districts: {
    symbol: DistrictSymbol;
    tenancies: number;
    capacity: number;
    open: boolean;
    available: boolean;
    tableEmoji: string;
    buttonEmoji: string;
  }[];
};

export default class EnterTheProjectsController {
  static messageEntryData: EntryData | null;
  static rateLimited = false;

  static async init() {
    await this.update();
    await this.bindButtonListeners();
  }

  static async bindButtonListeners() {
    const bb = Global.bot("BIG_BROTHER");
    await bb.ready;

    bb.client.on("interactionCreate", async (i) => {
      if (i.isButton() && i.customId.startsWith("ENTER_GAME_APARTMENT:")) {
        this.handleButtonPress(i);
      }
    });
  }

  static async update() {
    const data = await this.computeEntryData();
    await this.setEnterMessages(data);
    this.setStatus(data.open);
  }

  static async computeEntryData(): Promise<EntryData> {
    const capacity = Config.general("DISTRICT_CAPACITY");

    const districts = await District.find({
      relations: ["tenancies"],
      order: { symbol: 1 },
    });

    const computedDistricts: EntryData["districts"] = districts.map((d) => {
      const available = d.open && d.tenancies.length < capacity;
      return {
        open: d.open,
        symbol: d.symbol,
        tenancies: d.tenancies.length,
        capacity: capacity - d.tenancies.length,
        available,
        tableEmoji: d.open ? d.activeEmoji : d.inactiveEmoji,
        buttonEmoji: available ? d.activeEmoji : d.inactiveEmoji,
      };
    });

    return {
      open: computedDistricts.some((d) => d.available),
      districts: computedDistricts,
    };
  }

  static makeEntryMessage(data: EntryData) {
    const buttons = data.districts.map((d) => {
      return new MessageButton()
        .setLabel("JOIN")
        .setEmoji(d.buttonEmoji)
        .setStyle(d.available ? "SUCCESS" : "SECONDARY")
        .setDisabled(!d.available)
        .setCustomId(`ENTER_GAME_APARTMENT:${d.symbol}`);
    });

    const capacity = Config.general("DISTRICT_CAPACITY");

    const districtTable = data.districts
      .map((d) => {
        return `${d.tableEmoji} => ${
          d.open
            ? `\` [OPEN] \` => \`${d.capacity}/${capacity} available\``
            : `\`[CLOSED]\` => \`${d.capacity}/${capacity} available\``
        }`;
      })
      .join("\n");

    const message: MessageOptions = {
      content: `**SPACE IN ${Format.worldName()} IS LIMITED**.\nSee the below information to see for available apartments. **Press the buttons below** to join a district and enter the game.`,
      embeds: [
        {
          author: {
            iconURL:
              "https://s10.gifyu.com/images/Mind-Control-Degenz-V2-min.gif",
            name: "Available Apartments",
          },
          // title: ":cityscape:\u200b \u200bAvailable Apartments",
          description: `Beautopia is divided in to districts, 1 to 6. To play the game, you'll need your own apartment. As apartments become available, the buttons below will become active. Check back often to secure your space in ${Format.worldName()}.\n\n${districtTable}`,
          footer: {
            // iconURL: bb.client.user!.displayAvatarURL(),
            text: "Press the District button below to join that district.",
          },
        },
      ],
      components: [
        new MessageActionRow().addComponents(buttons.slice(0, 3)),
        new MessageActionRow().addComponents(buttons.slice(3)),
      ],
    };

    return message;
  }

  static async setEnterMessages(data: EntryData) {
    const entryOptions = this.makeEntryMessage(data);
    await PersistentMessageController.set("THE_PROJECTS_ENTRY", entryOptions);
  }

  static async handleButtonPress(i: ButtonInteraction) {
    await i.deferReply({ ephemeral: true });
    const user = await User.findOneOrFail({ where: { discordId: i.user.id } });

    if (user.inGame) {
      await i.editReply({
        content: `${userMention(user.discordId)} - You're already a Degen.`,
      });
      return;
    }

    const [_, districtSymbol] = i.customId.split(":") as [any, DistrictSymbol];
    const res = await UserController.initApartment(
      i.user.id,
      true,
      districtSymbol
    );

    if (res.success) {
      Events.emit("GAME_ENTERED_APARTMENT", {
        user: res.user!,
        district: (res.user!.primaryTenancy as ApartmentTenancy).district,
      });
      const user = userMention(i.user.id);
      const channel = channelMention(res.user!.primaryTenancy.discordChannelId);

      await i.editReply({
        content: `${user} - Go to ${channel}, your new *private* apartment to receive further instructions.`,
      });

      EnterTheProjectsController.update();
    }
  }

  static async setStatus(open: boolean, isRetry = false) {
    if (this.rateLimited && !isRetry) {
      return { status: 429 };
    }

    const admin = Global.bot("ADMIN");
    const room = await admin.getTextChannel(
      Config.channelId("ENTER_THE_PROJECTS")
    );

    const disabled = `\u{1f510}\uff5cthe-projects`;
    const enabled = `\u{1f513}\uff5cthe-projects`;

    const newName = open ? enabled : disabled;

    if (room.name === newName) {
      return { status: 304 };
    }

    const res = await axios({
      method: "PATCH",
      baseURL: "https://discord.com/api/v9",
      url: `/channels/${Config.channelId("ENTER_THE_PROJECTS")}`,
      data: { name: newName },
      headers: {
        Accept: "application/json",
        Authorization: `Bot ${Config.botToken("ADMIN")}`,
      },
      validateStatus: () => true,
    });

    if (res.status === 429) {
      const wait = res.data.retry_after + 2;
      console.log(`RATE_LIMIT: retrying after ${wait} seconds`);
      this.rateLimited = true;
      setTimeout(async () => {
        const data = await this.computeEntryData();
        const res = await this.setStatus(data.open);
        console.log("retry:", res);
        if (res.status >= 200 && res.status < 300) {
          console.log(`RATE_LIMIT_LIFTED: waiting room status in sync`);
        }
      }, wait * 1000);
    } else if (res.status < 200 || res.status >= 300) {
      console.log(res.status, res.statusText);
    } else {
      this.rateLimited = false;
    }

    return res;
  }
}
