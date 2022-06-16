import React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import Body from "../components/Body";

function App({ Component, pageProps }: AppProps) {
  return (
    <Body>
      <Head>
        <title>Degenz NFT Game</title>
        <meta name="description" content="A P2E Revolution" />
      </Head>
      <Component {...pageProps} />
    </Body>
  );
}

export default App;
