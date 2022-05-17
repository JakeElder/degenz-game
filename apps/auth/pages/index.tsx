import type { GetServerSideProps, NextPage } from "next";
import React, { AnchorHTMLAttributes, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Button, Grid, Stack, TextField } from "@mui/material";
import qs from "query-string";
import axios from "axios";
import { useRouter } from "next/router";
import { connect, NPC } from "data/db";
import Config from "config";
import { Not, In } from "typeorm";
import _ from "class-transformer";

const API_URL = "https://discord.com/api";

type Props = { npcs: ReturnType<NPC["toJSON"]>[] };

const UpdateButton = ({
  clientId,
  guildId,
  redirectUri,
  botName,
  onClick,
}: {
  clientId: string;
  guildId: string;
  redirectUri: string;
  botName: string;
  onClick: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
}) => {
  const authUrlParams = qs.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    guild_id: guildId,
    scope: "applications.commands.permissions.update",
  });

  return (
    <>
      <Button
        variant="outlined"
        href={`${API_URL}/oauth2/authorize?${authUrlParams}`}
        onClick={onClick}
      >
        Update {botName}
      </Button>
    </>
  );
};

const Home: NextPage<{ npcs: NPC[] }> = ({ npcs }) => {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params.code) {
      setCode(params.code);
      router.push("/", undefined, { shallow: true });
    }
  });

  useEffect(() => {
    if (code) {
      const clientId = window.localStorage.getItem("npcId");
      axios
        .post("/api/commands", { code, clientId })
        .then((r) => console.log(r.data));
    }
  }, [code]);

  return (
    <div className={styles.container}>
      <Stack spacing={2}>
        {npcs.map((npc) => {
          return (
            <UpdateButton
              key={npc.id}
              botName={npc.id}
              clientId={npc.clientId}
              redirectUri={process.env.REDIRECT_URI as string}
              guildId={process.env.GUILD_ID as string}
              onClick={(e) => {
                e.preventDefault();
                window.localStorage.setItem("npcId", npc.clientId);
                window.location.href = e.currentTarget.href;
              }}
            />
          );
        })}
      </Stack>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  await connect();
  await Config.load();

  const npcs = await NPC.find({
    where: {
      id: Not(In(["SENSEI", "SCOUT", "DEVILS_ADVOCATE", "ARMORY_CLERK"])),
    },
    order: { id: 1 },
  });

  return {
    props: {
      npcs: npcs.map((npc) => npc.toJSON()),
    },
  };
};

export const Revoke = () => {
  const [revokeToken, setRevokeToken] = useState<string>("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        axios
          .post(
            "https://discord.com/api/oauth2/token/revoke",
            new URLSearchParams({
              client_id: process.env.CLIENT_ID!,
              client_secret: process.env.CLIENT_SECRET!,
              token: revokeToken,
            })
          )
          .then((res) => console.log(res))
          .catch((e) => console.error(e));
      }}
    >
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              size="small"
              variant="outlined"
              type="text"
              value={revokeToken}
              onChange={(v) => setRevokeToken(v.target.value)}
            />
          </Grid>
          <Grid item>
            <Button variant="outlined" type="submit">
              Revoke
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </form>
  );
};

export default Home;
