import { Command as OclifCommand } from "@oclif/core";
import axios from "axios";

export default abstract class Command extends OclifCommand {
  async get(route: string, token: string) {
    return axios({
      method: "GET",
      url: `https://discord.com/api/v9${route}`,
      headers: { Authorization: `Bot ${token}` },
    });
  }
}
