export type Technology = 'GPON' | 'HFC' | 'COPPER';

export const TECHNOLOGY_LIST: readonly Technology[] = [
  'GPON',
  'HFC',
  'COPPER',
] as const;

export function isTechnology(value: unknown): value is Technology {
  return (
    typeof value === 'string' &&
    (TECHNOLOGY_LIST as readonly string[]).includes(value)
  );
}
