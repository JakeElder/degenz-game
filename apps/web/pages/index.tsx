import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import logo from "../public/logo.png";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Degenz NFT Game</title>
        <meta name="description" content="A P2E Revolution" />
      </Head>

      <main className={styles.main}>
        <span style={{ margin: "auto" }}>confirmed.</span>
        <div style={{ width: 130, paddingBottom: 30 }}>
          <Image src={logo} layout="responsive" alt="Degenz" />
        </div>
      </main>
    </div>
  );
};

export default Home;
