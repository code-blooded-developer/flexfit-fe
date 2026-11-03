import type { Metadata } from "next";

import CompleteView from "./_components/CompleteView";

export const metadata: Metadata = {
  title: "Workout complete — FlexFit",
};

export default function CompletePage() {
  return <CompleteView />;
}
