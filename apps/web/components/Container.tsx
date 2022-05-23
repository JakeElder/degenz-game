import styled from "@emotion/styled";
import { PropsWithChildren } from "react";

type Props = {};

const Root = styled.div`
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Container = ({ children }: PropsWithChildren<Props>) => {
  return <Root>{children}</Root>;
};

export default Container;
