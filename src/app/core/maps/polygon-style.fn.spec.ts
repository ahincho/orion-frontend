import { describe, it, expect } from 'vitest';
import type { Feature, Polygon } from 'geojson';

import {
  resolvePolygonStyle,
  readPolygonPropertyId,
} from './polygon-style.fn';

function makeFeature(props: Record<string, unknown>): Feature<Polygon> {
  return {
    type: 'Feature',
    id: 'feature-1',
    properties: props,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-77.05, -12.06],
          [-77.04, -12.06],
          [-77.04, -12.05],
          [-77.05, -12.05],
          [-77.05, -12.06],
        ],
      ],
    },
  };
}

describe('polygon-style helpers', () => {
  it('returns undefined when properties are missing', () => {
    const feature: Feature<Polygon> = {
      type: 'Feature',
      properties: null,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-77.05, -12.06],
            [-77.04, -12.06],
            [-77.04, -12.05],
            [-77.05, -12.05],
            [-77.05, -12.06],
          ],
        ],
      },
    };
    expect(resolvePolygonStyle(feature)).toBeUndefined();
  });

  it('resolves a palette entry when the classification is present', () => {
    const feature = makeFeature({ id: 'p1', clasificacion: 'A' });
    expect(resolvePolygonStyle(feature)?.fill).toBeTruthy();
  });

  it('falls back to the default classification', () => {
    const feature = makeFeature({ id: 'p2', clasificacion: 'mystery' as never });
    expect(resolvePolygonStyle(feature)?.fill).toBeTruthy();
  });

  it('exposes the polygon id from properties', () => {
    expect(readPolygonPropertyId(makeFeature({ id: 'p1' }))).toBe('p1');
    expect(readPolygonPropertyId(makeFeature({}))).toBeNull();
    expect(readPolygonPropertyId(makeFeature({ id: 7 as never }))).toBeNull();
  });
});
