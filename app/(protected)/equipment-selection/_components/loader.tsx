"use client";

type Props = {
  isLoading: boolean;
};

export function Loader({ isLoading }: Props) {
  if (!isLoading) return null;
  return (
    <div className="px-6 pt-2 flex flex-col gap-6">
      {[0, 1, 2, 3].map((si) => (
        <div key={si} className="flex flex-col gap-2">
          <div className="h-4 w-28 rounded-md bg-secondary animate-pulse mb-1" />
          <div className="flex flex-col rounded-2xl bg-card overflow-hidden divide-y divide-border/40">
            {[0, 1, 2].map((ri) => (
              <div key={ri} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-9 h-9 rounded-lg bg-secondary animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-3.5 w-32 rounded-md bg-secondary animate-pulse" />
                  <div className="h-3 w-20 rounded-md bg-secondary/60 animate-pulse" />
                </div>
                <div className="w-6 h-6 rounded-full bg-secondary animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
