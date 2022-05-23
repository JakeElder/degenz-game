import Link from "next/link";
import React from "react";

type Props = {};

const Nav = ({}: Props) => {
  return (
    <nav>
      <Link href="/">about</Link>
      <Link href="/leaderboard">leaderboard</Link>
    </nav>
  );
};

export default Nav;
