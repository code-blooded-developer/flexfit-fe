export const fieldClass = (hasError: boolean, extra = "") =>
  `w-full pl-12 pr-4 py-4 rounded-xl bg-secondary border text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-border focus:border-primary"
  } ${extra}`;
