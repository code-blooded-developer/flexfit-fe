import type { Metadata } from "next";

import RestView from "./_components/RestView";

export const metadata: Metadata = {
  title: "Rest — FlexFit",
};

export default function RestPage() {
  return <RestView />;
}
