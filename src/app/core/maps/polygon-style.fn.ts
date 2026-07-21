import type { Feature, Geometry } from 'geojson';

import type { GeoJsonLayerStyle } from './map.types';
import {
  classificationColor,
  type ClassificationKey,
} from '../types/classification.types';

export interface PolygonPropertiesBag {
  readonly id?: string;
  readonly codigo?: string;
  readonly nombre?: string;
  readonly tecnologia?: string;
  readonly clasificacion?: ClassificationKey;
  readonly estado?: 'active' | 'pending' | 'archived';
  readonly fill?: string;
  readonly stroke?: string;
}

function readProperties(feature: Feature<Geometry>): PolygonPropertiesBag | null {
  if (feature.properties === null || typeof feature.properties !== 'object') {
    return null;
  }
  return feature.properties as PolygonPropertiesBag;
}

/**
 * Resolves the paint spec for a polygon feature using the classification
 * tag stored in its properties bag. Falls back to the default classification
 * palette when the tag is missing or unknown.
 */
export function resolvePolygonStyle(
  feature: Feature<Geometry>,
): GeoJsonLayerStyle | undefined {
  const properties = readProperties(feature);
  if (!properties) {
    return undefined;
  }
  const palette = classificationColor(properties.clasificacion ?? null);
  return {
    fill: palette.fill,
    stroke: palette.stroke,
  };
}

export function readPolygonPropertyId(
  feature: Feature<Geometry>,
): string | null {
  const properties = readProperties(feature);
  if (!properties || typeof properties.id !== 'string') {
    return null;
  }
  return properties.id;
}

export function readPolygonPropertyClassification(
  feature: Feature<Geometry>,
): ClassificationKey | null {
  const properties = readProperties(feature);
  return properties?.clasificacion ?? null;
}
