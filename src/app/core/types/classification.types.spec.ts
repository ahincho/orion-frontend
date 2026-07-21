import { describe, it, expect } from 'vitest';

import {
  CLASSIFICATION_PALETTE,
  DEFAULT_CLASSIFICATION,
  classificationColor,
} from './classification.types';

describe('classification palette', () => {
  it('exposes all five buckets', () => {
    expect(CLASSIFICATION_PALETTE).toHaveLength(5);
    const keys = CLASSIFICATION_PALETTE.map((entry) => entry.key);
    expect(keys).toContain('A');
    expect(keys).toContain('B');
    expect(keys).toContain('C');
    expect(keys).toContain('default');
    expect(keys).toContain('far');
  });

  it('returns the entry whose key matches', () => {
    expect(classificationColor('A').fill).toBeTruthy();
    expect(classificationColor('far').stroke).toBeTruthy();
  });

  it('falls back to default when the key is unknown', () => {
    const fallback = classificationColor('unknown' as never);
    expect(fallback.key).toBe(DEFAULT_CLASSIFICATION);
  });

  it('falls back to default when the key is null or undefined', () => {
    expect(classificationColor(null).key).toBe(DEFAULT_CLASSIFICATION);
    expect(classificationColor(undefined).key).toBe(DEFAULT_CLASSIFICATION);
  });
});
