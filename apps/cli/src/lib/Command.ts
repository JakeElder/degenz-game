import { Command as OclifCommand } from "@oclif/core";
import axios, { AxiosResponse } from "axios";
import delay from "delay";
import { json } from "../utils";

export default abstract class Command extends OclifCommand {
  async get(route: string, token: string) {
    return axios({
      method: "GET",
      url: `https://discord.com/api/v9${route}`,
      headers: { Authorization: `Bot ${token}` },
    });
  }

  async delete(route: string, token: string) {
    return axios({
      method: "DELETE",
      url: `https://discord.com/api/v9${route}`,
      headers: { Authorization: `Bot ${token}` },
    });
  }

  async patch(
    route: string,
    data: any,
    token: string
  ): Promise<AxiosResponse<any, any>> {
    const res = await axios({
      method: "PATCH",
      data,
      url: `https://discord.com/api/v9${route}`,
      headers: { Authorization: `Bot ${token}`, Accept: "application/json" },
      validateStatus: () => true,
    });

    if (res.status === 429) {
      await delay((res.data.retry_after + 2) * 1000);
      return this.patch(route, data, token);
    }

    if (res.status < 200 || res.status >= 300) {
      this.debug(json(res));
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    return res;
  }

  async put(route: string, data: any, token: string) {
    const res = await axios({
      method: "PUT",
      data,
      url: `https://discord.com/api/v9${route}`,
      headers: { Authorization: `Bot ${token}` },
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      this.debug(json(res));
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    return res;
  }

  async post(route: string, data: any, token: string) {
    const res = await axios({
      method: "POST",
      data,
      url: `https://discord.com/api/v9${route}`,
      headers: { Authorization: `Bot ${token}` },
      validateStatus: () => true,
    });

    if (res.status < 200 || res.status >= 300) {
      this.debug(json(res));
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    return res;
  }
}
