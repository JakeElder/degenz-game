import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import logo from "../public/logo.png";
import { connect, User } from "data/db";
import Config from "config";
import Container from "../components/Container";

type Props = { users: ReturnType<User["toJSON"]>[] };

const Home: NextPage<Props> = (props) => {
  return (
    <>
      <Container>
        <pre>{JSON.stringify(props, null, 2)}</pre>
        <Image src={logo} layout="responsive" alt="Degenz" />
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  await connect();
  await Config.load();

  const users = await User.leaders(30);

  return {
    props: {
      users: users.map((user) => user.toJSON()),
    },
  };
};
export default Home;
