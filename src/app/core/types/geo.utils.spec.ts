import { describe, it, expect } from 'vitest';
import type { Feature, Polygon } from 'geojson';

import {
  isValidPolygon,
  isPointInsidePolygon,
  lngLatBoundsFromPolygon,
  asGeometryCollection,
  type LngLat,
} from './index';

const lima = (lng: number, lat: number): LngLat => [lng, lat];

function buildPolygon(
  ring: [number, number][],
): Feature<Polygon> {
  const closed = [...ring, ring[0]];
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [closed],
    },
  };
}

const sanePolygon: Feature<Polygon> = buildPolygon([
  [-77.05, -12.06],
  [-77.04, -12.06],
  [-77.04, -12.05],
  [-77.05, -12.05],
]);

describe('isValidPolygon', () => {
  it('accepts a well-formed polygon', () => {
    const result = isValidPolygon(sanePolygon);
    expect(result.ok).toBe(true);
  });

  it('rejects null', () => {
    const result = isValidPolygon(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issue.code).toBe('no-vertices');
    }
  });

  it('rejects a feature without polygon geometry', () => {
    const result = isValidPolygon({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [-77.05, -12.06] },
    } as unknown as Feature<Polygon>);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issue.code).toBe('not-a-polygon');
    }
  });

  it('rejects polygons with fewer than four closed vertices', () => {
    const result = isValidPolygon(
      buildPolygon([
        [-77.05, -12.06],
        [-77.04, -12.06],
      ]),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issue.code).toBe('invalid-geometry');
    }
  });
});

describe('lngLatBoundsFromPolygon', () => {
  it('returns southwest and northeast corners', () => {
    const bounds = lngLatBoundsFromPolygon(sanePolygon);
    expect(bounds.southwest[0]).toBeCloseTo(-77.05, 5);
    expect(bounds.southwest[1]).toBeCloseTo(-12.06, 5);
    expect(bounds.northeast[0]).toBeCloseTo(-77.04, 5);
    expect(bounds.northeast[1]).toBeCloseTo(-12.05, 5);
  });
});

describe('isPointInsidePolygon', () => {
  it('returns true for a point inside the polygon', () => {
    expect(isPointInsidePolygon(lima(-77.045, -12.055), sanePolygon)).toBe(
      true,
    );
  });

  it('returns false for a point outside the polygon', () => {
    expect(isPointInsidePolygon(lima(-77.07, -12.07), sanePolygon)).toBe(
      false,
    );
  });
});

describe('asGeometryCollection', () => {
  it('returns an empty array for null', () => {
    expect(asGeometryCollection(null)).toEqual([]);
  });

  it('wraps a single geometry into a feature', () => {
    const result = asGeometryCollection({
      type: 'Polygon',
      coordinates: [sanePolygon.geometry.coordinates[0]],
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('Feature');
  });

  it('flattens a FeatureCollection', () => {
    const result = asGeometryCollection({
      type: 'FeatureCollection',
      features: [sanePolygon, sanePolygon],
    });
    expect(result).toHaveLength(2);
  });
});
