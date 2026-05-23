"use client";

import { Search, X } from "lucide-react";

type Props = {
  isLoading: boolean;
  selectedCount: number;
  environment: string;
  query: string;
  setQuery: (query: string) => void;
};

export function Header({
  selectedCount,
  environment,
  query,
  setQuery,
  isLoading,
}: Props) {
  return (
    <div className="px-6 pt-12 pb-4 sticky top-0 z-20 bg-background/95 backdrop-blur-lg">
      <div className="mb-5">
        <p className="text-xs text-muted-foreground">
          {selectedCount} selected · {environment}
        </p>
      </div>

      <h1 className="text-2xl font-bold font-display text-foreground mb-1">
        Review your equipments
      </h1>
      <p className="text-muted-foreground text-sm mb-5">
        We selected equipments based on where you workout. You can edit this now
        or adjust later.
      </p>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={query}
          disabled={isLoading}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search equipment..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-card border-2 border-transparent text-foreground text-sm outline-none focus:border-primary transition-all"
        />
        {query && (
          <button
            disabled={isLoading}
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-secondary text-muted-foreground"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
