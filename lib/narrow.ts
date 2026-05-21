export function narrow<T extends string>(value: string, valid: readonly T[]): T {
  if ((valid as readonly string[]).includes(value)) return value as T;
  throw new Error(`Invalid value: "${value}"`);
}
