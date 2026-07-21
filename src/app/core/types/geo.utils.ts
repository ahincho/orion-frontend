import { feature as turfFeature } from '@turf/helpers';
import { bbox } from '@turf/bbox';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';

import type { Feature, Polygon } from 'geojson';

import type { LngLat, LngLatBoundsLiteral } from './geo.types';

export interface PolygonValidationIssue {
  readonly code: 'not-a-polygon' | 'invalid-geometry' | 'no-vertices';
  readonly message: string;
}

export type PolygonValidationResult =
  | { readonly ok: true; readonly polygon: Feature<Polygon> }
  | { readonly ok: false; readonly issue: PolygonValidationIssue };

export function isValidPolygon(
  feature: Feature<Polygon> | null | undefined,
): PolygonValidationResult {
  if (!feature) {
    return {
      ok: false,
      issue: {
        code: 'no-vertices',
        message: 'Polygon feature is missing.',
      },
    };
  }
  const geometry = feature.geometry;
  if (!geometry || geometry.type !== 'Polygon') {
    return {
      ok: false,
      issue: {
        code: 'not-a-polygon',
        message: 'Feature is not a Polygon geometry.',
      },
    };
  }
  const ringLength = geometry.coordinates?.[0]?.length ?? 0;
  if (ringLength < 4) {
    return {
      ok: false,
      issue: {
        code: 'invalid-geometry',
        message: 'Polygon must close with at least four vertices.',
      },
    };
  }
  try {
    const wrapped = turfFeature(geometry);
    const bboxResult = bbox(wrapped);
    if (
      !Number.isFinite(bboxResult[0]) ||
      !Number.isFinite(bboxResult[1]) ||
      !Number.isFinite(bboxResult[2]) ||
      !Number.isFinite(bboxResult[3])
    ) {
      return {
        ok: false,
        issue: {
          code: 'invalid-geometry',
          message: 'Polygon bounding box is not finite.',
        },
      };
    }
  } catch {
    return {
      ok: false,
      issue: {
        code: 'invalid-geometry',
        message: 'Polygon geometry failed to evaluate.',
      },
    };
  }
  return { ok: true, polygon: feature };
}

export function lngLatBoundsFromPolygon(
  polygon: Feature<Polygon>,
): LngLatBoundsLiteral {
  const result = bbox(polygon);
  return {
    southwest: [result[0], result[1]] as LngLat,
    northeast: [result[2], result[3]] as LngLat,
  };
}

export function isPointInsidePolygon(
  point: LngLat,
  polygon: Feature<Polygon>,
): boolean {
  const pt = turfFeature({ type: 'Point', coordinates: point });
  return booleanPointInPolygon(pt, polygon);
}
