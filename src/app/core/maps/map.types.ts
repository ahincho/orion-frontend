import type { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';

/**
 * Paint spec accepted by {@link GeoJsonLayerComponent} when rendering a
 * feature. The undefined entries mean "use the layer default".
 */
export interface GeoJsonLayerStyle {
  readonly fill?: string;
  readonly fillOpacity?: number;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeOpacity?: number;
}

export type GeoJsonLayerStyleFn = (
  feature: GeoJsonFeatureLike,
) => GeoJsonLayerStyle | undefined;

/**
 * Lightweight shape of the GeoJSON features MapLibre layers consume. Mirrors
 * `@types/geojson` minus the strict geometry union this project never uses.
 */
export interface GeoJsonFeatureLike {
  readonly type: 'Feature';
  readonly id?: string | number;
  readonly geometry: GeoJsonGeometryLike;
  readonly properties?: Readonly<Record<string, unknown>>;
}

export type GeoJsonGeometryLike =
  | { readonly type: 'Point'; readonly coordinates: readonly [number, number] }
  | {
      readonly type: 'LineString';
      readonly coordinates: readonly (readonly [number, number])[];
    }
  | {
      readonly type: 'Polygon';
      readonly coordinates: readonly (readonly (readonly [number, number])[])[];
    }
  | {
      readonly type: 'MultiPolygon';
      readonly coordinates: readonly (readonly (readonly (readonly [number, number])[])[])[];
    };

export interface GeoJsonFeatureCollectionLike {
  readonly type: 'FeatureCollection';
  readonly features: readonly GeoJsonFeatureLike[];
}

export type GeoJsonInput =
  | GeoJsonFeatureCollectionLike
  | readonly GeoJsonFeatureLike[]
  | GeoJsonFeatureLike
  | null
  | undefined;

export interface MapShellConfig {
  readonly styleUrl: string;
  readonly center?: LngLatLike;
  readonly zoom?: number;
  readonly maxBounds?: LngLatBoundsLike | null;
  readonly interactive?: boolean;
  readonly showAttribution?: boolean;
}
