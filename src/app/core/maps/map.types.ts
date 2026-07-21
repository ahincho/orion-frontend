import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';

export type { Feature, FeatureCollection, Geometry } from 'geojson';
export type GeoJsonInput =
  | FeatureCollection<Geometry>
  | Feature<Geometry>[]
  | Feature<Geometry>
  | null
  | undefined;

export interface GeoJsonLayerStyle {
  readonly fill?: string;
  readonly fillOpacity?: number;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeOpacity?: number;
}

export type GeoJsonLayerStyleFn = (
  feature: Feature<Geometry>,
) => GeoJsonLayerStyle | undefined;

export interface MapShellConfig {
  readonly styleUrl: string;
  readonly center?: LngLatLike;
  readonly zoom?: number;
  readonly maxBounds?: LngLatBoundsLike | null;
  readonly interactive?: boolean;
  readonly showAttribution?: boolean;
}
