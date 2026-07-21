import { describe, it, expect } from 'vitest';

import {
  TECHNOLOGY_LIST,
  isTechnology,
  type Technology,
} from './technology.types';

describe('Technology', () => {
  it('exposes GPON, HFC, and COPPER as the only valid values', () => {
    expect([...TECHNOLOGY_LIST].sort()).toEqual(['COPPER', 'GPON', 'HFC']);
  });

  it('matches only the canonical strings', () => {
    const samples: readonly (readonly [unknown, boolean])[] = [
      ['GPON', true],
      ['HFC', true],
      ['COPPER', true],
      ['gpon', false],
      ['fibra', false],
      [null, false],
      [123, false],
    ];
    for (const [value, expected] of samples) {
      expect(isTechnology(value)).toBe(expected);
    }
  });

  it('narrows the type after isTechnology returns true', () => {
    const value: unknown = 'GPON';
    if (isTechnology(value)) {
      const tech: Technology = value;
      expect(tech).toBe('GPON');
    } else {
      throw new Error('GPON should be a valid Technology');
    }
  });
});
