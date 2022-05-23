import styled from "@emotion/styled";
import { PropsWithChildren } from "react";

type Props = {};

const Root = styled.div`
  background: #222;
  color: #fff;
  font-family: "lores-12";
  min-height: 100vh;
`;

const Body = (props: PropsWithChildren<Props>) => {
  return <Root>{props.children}</Root>;
};

export default Body;
