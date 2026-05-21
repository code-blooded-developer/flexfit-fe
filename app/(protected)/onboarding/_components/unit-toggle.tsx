"use client";

export const UnitToggle = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) => (
  <div className="flex gap-1 p-1 rounded-xl bg-secondary">
    {options.map((o) => (
      <button
        key={o}
        type="button"
        onClick={() => onChange(o)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          value === o
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);
