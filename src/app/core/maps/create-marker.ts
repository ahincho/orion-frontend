import maplibregl, {
  type LngLatLike,
  type Marker,
} from 'maplibre-gl';

/**
 * Options accepted by {@link createMarker}. Mirrors the subset of
 * `maplibregl.MarkerOptions` we actually use across features.
 */
export interface CreateMarkerOptions {
  readonly lngLat: LngLatLike;
  readonly color?: string;
  readonly draggable?: boolean;
  readonly rotation?: number;
  readonly element?: HTMLElement;
  readonly offset?: readonly [number, number];
}

/**
 * Factory that builds a fully-configured `maplibregl.Marker`. Centralized
 * here so callers don't have to import the runtime maplibregl module and
 * to give feature code a single seam for swapping in test mocks later.
 */
export function createMarker(options: CreateMarkerOptions): Marker {
  const marker = new maplibregl.Marker({
    color: options.color,
    draggable: options.draggable,
    rotation: options.rotation,
    element: options.element,
    offset: options.offset
      ? new maplibregl.Point(options.offset[0], options.offset[1])
      : undefined,
  });
  marker.setLngLat(options.lngLat);
  return marker;
}
