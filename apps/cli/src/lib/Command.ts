import { Command as OclifCommand } from "@oclif/core";
import axios, { AxiosResponse } from "axios";
import delay from "delay";
import { json } from "../utils";

const http = axios.create({
  baseURL: "https://discord.com/api/v9",
  headers: { Accept: "application/json" },
});

export default abstract class Command extends OclifCommand {
  async get(route: string, token: string) {
    return http({
      method: "GET",
      url: route,
      headers: { Authorization: `Bot ${token}` },
    });
  }

  async delete(route: string, token: string) {
    return http({
      method: "DELETE",
      url: route,
      headers: { Authorization: `Bot ${token}` },
    });
  }

  async push(
    route: string,
    data: any,
    token: string,
    method: "PUT" | "POST" | "PATCH"
  ): Promise<AxiosResponse<any, any>> {
    const res = await http({
      method,
      data,
      url: route,
      headers: { Authorization: `Bot ${token}` },
      validateStatus: () => true,
    });

    if (res.status === 429) {
      this.debug(`Waiting ${res.data.retry_after + 2} seconds`);
      await delay((res.data.retry_after + 2) * 1000);
      return this.patch(route, data, token);
    }

    if (res.status < 200 || res.status >= 300) {
      this.debug(json(res));
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    return res;
  }

  async patch(route: string, data: any, token: string) {
    return this.push(route, data, token, "PATCH");
  }

  async put(route: string, data: any, token: string) {
    return this.push(route, data, token, "PUT");
  }

  async post(route: string, data: any, token: string) {
    return this.push(route, data, token, "POST");
  }
}
