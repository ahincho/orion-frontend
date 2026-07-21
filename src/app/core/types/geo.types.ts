import type { Feature, FeatureCollection, Geometry } from 'geojson';

export type { Feature, FeatureCollection, Geometry, Position } from 'geojson';

export type LngLat = [number, number];

export interface LngLatBoundsLiteral {
  readonly southwest: LngLat;
  readonly northeast: LngLat;
}

export type GeometryCollection =
  | Geometry
  | Feature<Geometry>
  | FeatureCollection
  | readonly (Feature<Geometry>)[];

export function asGeometryCollection(
  input: GeometryCollection | null | undefined,
): readonly Feature<Geometry>[] {
  if (input == null) {
    return [];
  }
  if (Array.isArray(input)) {
    return input;
  }
  if ('type' in input) {
    if (input.type === 'FeatureCollection') {
      return input.features;
    }
    if (input.type === 'Feature') {
      return [input as Feature<Geometry>];
    }
    return [{ type: 'Feature', geometry: input as Geometry, properties: {} }];
  }
  return [];
}
