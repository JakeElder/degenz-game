import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import logo from "../public/logo.png";
import { connect, NPC } from "data/db";
import Config from "config";
import { Not, In } from "typeorm";
import Container from "../components/Container";

type Props = { npcs: ReturnType<NPC["toJSON"]>[] };

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
export default Home;
