import Listr from "listr";
import {
  AppState,
  Achievement,
  District,
  MartItem,
  NPC,
  PersistentMessage,
  User,
} from "data/db";
import { Command } from "../../lib";

export default class Seed extends Command {
  static description = "Seeds the database";

  async run(): Promise<void> {
    const listr = new Listr([
      {
        title: "User",
        task: async () => {
          await User.delete({});
        },
      },
      {
        title: "Achievements",
        task: async () => {
          await Achievement.delete({});
        },
      },
      {
        title: "App State",
        task: async () => {
          await AppState.delete({});
        },
      },
      {
        title: "Districts",
        task: async () => {
          await District.delete({});
        },
      },
      {
        title: "Mart Items",
        task: async () => {
          await MartItem.delete({});
        },
      },
      {
        title: "NPC",
        task: async () => {
          await NPC.delete({});
        },
      },
      {
        title: "Persistent Message",
        task: async () => {
          await PersistentMessage.delete({});
        },
      },
    ]);

    await listr.run();
  }
}
