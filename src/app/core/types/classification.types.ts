export type ClassificationKey = 'A' | 'B' | 'C' | 'default' | 'lejano';

export interface ClassificationColor {
  readonly key: ClassificationKey;
  readonly fill: string;
  readonly stroke: string;
  readonly label: string;
}

export const CLASSIFICATION_PALETTE: readonly ClassificationColor[] = [
  { key: 'A', fill: '#3b82f6', stroke: '#1d4ed8', label: 'A - prioritaria' },
  { key: 'B', fill: '#22c55e', stroke: '#15803d', label: 'B - estandar' },
  { key: 'C', fill: '#facc15', stroke: '#a16207', label: 'C - extendida' },
  {
    key: 'default',
    fill: '#94a3b8',
    stroke: '#475569',
    label: 'Sin clasificacion',
  },
  { key: 'lejano', fill: '#a855f7', stroke: '#6b21a8', label: 'Fuera de cobertura' },
] as const;

export const DEFAULT_CLASSIFICATION: ClassificationKey = 'default';

export function classificationColor(
  key: ClassificationKey | null | undefined,
): ClassificationColor {
  if (!key) {
    return CLASSIFICATION_PALETTE.find(
      (entry) => entry.key === DEFAULT_CLASSIFICATION,
    )!;
  }
  return (
    CLASSIFICATION_PALETTE.find((entry) => entry.key === key) ??
    CLASSIFICATION_PALETTE.find(
      (entry) => entry.key === DEFAULT_CLASSIFICATION,
    )!
  );
}
