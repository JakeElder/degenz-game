import type { NextApiRequest, NextApiResponse } from "next";
import Config from "config";
import { connect, disconnect } from "data/db";
import Manifest from "manifest";
import axios from "axios";

type Data = {};

const API_URL = "https://discord.com/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(404).json({});
    return;
  }

  await connect();
  await Config.load();
  const { npcs } = await Manifest.json();

  const clientId = req.body.clientId;
  const code = req.body.code;
  const npcSymbol = Config.reverseClientId(clientId);
  const npc = npcs.find((n) => n.id === npcSymbol);

  if (!npc) {
    throw new Error(`NPC ${npcSymbol} not found.`);
  }

  const GUILD_ID = Config.env("GUILD_ID");

  const data = npc.commands!.map((c) => {
    return {
      ...c.data,
      default_permission: c.permissions!.length === 0,
    };
  });

  const tokenRequest = await axios.post(
    `${API_URL}/oauth2/token`,
    new URLSearchParams({
      client_id: clientId,
      client_secret: Config.botClientSecret(npcSymbol),
      guild_id: GUILD_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI as string,
    }),
    { validateStatus: () => true }
  );

  if (tokenRequest.status < 200 || tokenRequest.status >= 300) {
    res.status(500).json(tokenRequest.data);
    return;
  }

  const commandPutRequest = await axios.put(
    `${API_URL}/applications/${clientId}/guilds/${GUILD_ID}/commands`,
    data,
    {
      headers: { authorization: `Bot ${Config.botToken(npcSymbol)}` },
      validateStatus: () => true,
    }
  );

  if (commandPutRequest.status < 200 || commandPutRequest.status >= 300) {
    res.status(500).json(tokenRequest.data);
    return;
  }

  await Promise.all(
    commandPutRequest.data
      .filter((d: any) => !d.default_permission)
      .map(async (d: any) => {
        const cmd = npc.commands!.find((c: any) => c.data.name === d.name)!;
        const permissions = cmd.permissions!.map((p) => ({
          ...p,
          id: Config.roleId(p.id!),
        }));

        const res = await axios.put(
          `${API_URL}/applications/${Config.clientId(
            npc.id!
          )}/guilds/${GUILD_ID}/commands/${d.id}/permissions`,
          { permissions },
          {
            validateStatus: () => true,
            headers: {
              authorization: `Bearer ${tokenRequest.data.access_token}`,
            },
          }
        );

        if (res.status < 200 || res.status >= 300) {
          console.error(res.data);
        }
      })
  );

  await disconnect();

  res.status(200).json({ success: true });
}
