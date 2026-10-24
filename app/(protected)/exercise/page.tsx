import type { Metadata } from "next";

import ExerciseFocus from "./_components/ExerciseFocus";

export const metadata: Metadata = {
  title: "Exercise — FlexFit",
};

type PageProps = {
  searchParams: Promise<{ exerciseId?: string | string[] }>;
};

export default async function ExercisePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.exerciseId;
  const exerciseId = Array.isArray(raw) ? raw[0] : raw;

  return <ExerciseFocus key={exerciseId ?? "none"} exerciseId={exerciseId ?? null} />;
}
