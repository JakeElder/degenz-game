import { Command as OclifCommand } from "@oclif/core";
import axios, { AxiosResponse } from "axios";
import Config from "config";
import { connect, disconnect } from "data/db";
import delay from "delay";
import Listr from "Listr";
import { json } from "../utils";

const http = axios.create({
  baseURL: "https://discord.com/api/v9",
  headers: { Accept: "application/json" },
});

export default abstract class Command extends OclifCommand {
  async init() {
    await connect();
    await Config.load();
  }

  async finally(err?: Error) {
    disconnect();
    return super.finally(err);
  }

  async get(route: string, token: string) {
    try {
      return http({
        method: "GET",
        url: route,
        headers: { Authorization: `Bot ${token}` },
      });
    } catch (e) {
      this.debug(e);
      throw e;
    }
  }

  async delete(route: string, token: string, task?: Listr.ListrTaskWrapper) {
    return this.req(route, null, token, "DELETE", task);
  }

  async req(
    route: string,
    data: any,
    token: string,
    method: "PUT" | "POST" | "PATCH" | "DELETE",
    task?: Listr.ListrTaskWrapper
  ): Promise<AxiosResponse<any, any>> {
    const res = await http({
      method,
      data,
      url: route,
      headers: { Authorization: `Bot ${token}` },
      validateStatus: () => true,
    });

    if (res.status === 429) {
      const wait = res.data.retry_after + 2;
      let delta = 0;

      if (task) {
        const update = () =>
          (task.output = `RATE_LIMITED: Waiting ${Math.round(
            wait - delta
          )} seconds`);
        const i = setInterval(() => {
          update();
          delta += 1;
          if (wait - delta < 1) {
            clearInterval(i);
          }
        }, 1000);
        update();
      } else {
        const update = () => {
          console.log();
          process.stdout.cursorTo(0);
          process.stdout.write(
            `RATE_LIMITED: Waiting ${Math.round(wait - delta)} seconds`
          );
        };
        const i = setInterval(() => {
          update();
          delta += 1;
          if (wait - delta < 1) {
            clearInterval(i);
          }
        }, 1000);
        update();
      }

      this.debug(`RATE_LIMITED: ${Math.round(wait)} seconds`);
      await delay((res.data.retry_after + 2) * 1000);
      console.log();
      return this.req(route, data, token, method, task);
    }

    if (res.status < 200 || res.status >= 300) {
      this.debug(json(res));
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    return res;
  }

  async patch(
    route: string,
    data: any,
    token: string,
    task?: Listr.ListrTaskWrapper
  ) {
    return this.req(route, data, token, "PATCH", task);
  }

  async put(
    route: string,
    data: any,
    token: string,
    task?: Listr.ListrTaskWrapper
  ) {
    return this.req(route, data, token, "PUT", task);
  }

  async post(
    route: string,
    data: any,
    token: string,
    task?: Listr.ListrTaskWrapper
  ) {
    return this.req(route, data, token, "POST", task);
  }
}
