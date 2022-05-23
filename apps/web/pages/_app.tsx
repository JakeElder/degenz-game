import React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { Transition, animated } from "react-spring";
import Body from "../components/Body";
import Nav from "../components/Nav";

function App({ Component, pageProps, router }: AppProps) {
  return (
    <Body>
      <Head>
        <title>Degenz NFT Game</title>
        <meta name="description" content="A P2E Revolution" />
      </Head>

      <Transition
        items={[{ id: router.route, Component, pageProps }]}
        keys={(item: any) => item.id}
        from={{ opacity: 0 }}
        enter={{ opacity: 1 }}
        leave={{ opacity: 0, position: "absolute" }}
      >
        {(styles, { pageProps, Component }) => (
          <animated.div style={{ ...styles, width: "100%" }}>
            <Nav />
            <Component {...pageProps} />
          </animated.div>
        )}
      </Transition>
    </Body>
  );
}

export default App;
